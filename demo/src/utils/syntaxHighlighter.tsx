export type TokenType =
  | 'keyword'
  | 'string'
  | 'function'
  | 'tag'
  | 'attr'
  | 'number'
  | 'comment'
  | 'type'
  | 'operator'
  | 'plain';

interface Token {
  type: TokenType;
  text: string;
}

/**
 * Tokenizes a line of code into colored syntax tokens.
 */
function tokenizeLine(line: string, language: string): Token[] {
  const tokens: Token[] = [];
  let remaining = line;

  // Pattern matching based on language
  const isBash = language === 'bash' || language === 'sh' || language === 'shell';
  const isCss = language === 'css';

  while (remaining.length > 0) {
    // 1. Comments
    if (remaining.startsWith('//') || (isBash && remaining.startsWith('#')) || remaining.startsWith('/*')) {
      tokens.push({ type: 'comment', text: remaining });
      break;
    }

    // 2. Strings ("...", '...', `...`)
    const strMatch = remaining.match(/^("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/);
    if (strMatch) {
      tokens.push({ type: 'string', text: strMatch[0] });
      remaining = remaining.slice(strMatch[0].length);
      continue;
    }

    // 3. Numbers
    const numMatch = remaining.match(/^\b\d+(?:\.\d+)?(?:ms|px|%|s|rem|em)?\b/);
    if (numMatch) {
      tokens.push({ type: 'number', text: numMatch[0] });
      remaining = remaining.slice(numMatch[0].length);
      continue;
    }

    // 4. Bash commands and flags
    if (isBash) {
      const cmdMatch = remaining.match(/^\b(npm|pnpm|yarn|npx|git|node|vite)\b/);
      if (cmdMatch) {
        tokens.push({ type: 'keyword', text: cmdMatch[0] });
        remaining = remaining.slice(cmdMatch[0].length);
        continue;
      }

      const subMatch = remaining.match(/^\b(install|add|run|build|test|publish|login|whoami|validate|commit|push)\b/);
      if (subMatch) {
        tokens.push({ type: 'function', text: subMatch[0] });
        remaining = remaining.slice(subMatch[0].length);
        continue;
      }

      const flagMatch = remaining.match(/^(-{1,2}[a-zA-Z0-9_-]+)/);
      if (flagMatch) {
        tokens.push({ type: 'attr', text: flagMatch[0] });
        remaining = remaining.slice(flagMatch[0].length);
        continue;
      }
    }

    // 5. CSS selectors & properties
    if (isCss) {
      const atRuleMatch = remaining.match(/^(@[a-zA-Z-]+|\.[a-zA-Z0-9_-]+)/);
      if (atRuleMatch) {
        tokens.push({ type: 'tag', text: atRuleMatch[0] });
        remaining = remaining.slice(atRuleMatch[0].length);
        continue;
      }
      const propMatch = remaining.match(/^([a-z-]+)(?=\s*:)/);
      if (propMatch) {
        tokens.push({ type: 'attr', text: propMatch[0] });
        remaining = remaining.slice(propMatch[0].length);
        continue;
      }
    }

    // 6. Toast methods (e.g. toast.success, toast.error, toast.promise)
    const toastMatch = remaining.match(/^(toast\.(?:success|error|info|warning|loading|custom|update|dismiss|remove|promise))\b/);
    if (toastMatch) {
      tokens.push({ type: 'function', text: toastMatch[0] });
      remaining = remaining.slice(toastMatch[0].length);
      continue;
    }

    // 7. JSX Tags (<Toaster, </Toaster>, <button, <div>, />)
    const jsxTagMatch = remaining.match(/^(\/?>|<\/?[A-Z][a-zA-Z0-9]*|<\/?(?:button|div|span|strong|p|code|pre|section|a|input|svg|path|rect)\b)/);
    if (jsxTagMatch) {
      tokens.push({ type: 'tag', text: jsxTagMatch[0] });
      remaining = remaining.slice(jsxTagMatch[0].length);
      continue;
    }

    // 8. Keywords (TS/JS)
    const kwMatch = remaining.match(/^\b(import|export|from|default|function|const|let|var|return|async|await|type|interface|class|new|typeof|void|true|false|null|undefined|try|catch|finally|throw|if|else|for|while|switch|case|break)\b/);
    if (kwMatch) {
      tokens.push({ type: 'keyword', text: kwMatch[0] });
      remaining = remaining.slice(kwMatch[0].length);
      continue;
    }

    // 9. Standard Types / Classes
    const typeMatch = remaining.match(/^\b(Toast|ToastOptions|ToastTheme|ToastPosition|ToastAnimationPreset|ToastDuplicateStrategy|ToasterProps|Promise|Error|React|CSSProperties|FC)\b/);
    if (typeMatch) {
      tokens.push({ type: 'type', text: typeMatch[0] });
      remaining = remaining.slice(typeMatch[0].length);
      continue;
    }

    // 10. Attributes / Properties / Keys (e.g., theme=, position:, onClick=)
    const attrMatch = remaining.match(/^([a-zA-Z0-9_]+)(?=\s*=|:\s*)/);
    if (attrMatch) {
      tokens.push({ type: 'attr', text: attrMatch[0] });
      remaining = remaining.slice(attrMatch[0].length);
      continue;
    }

    // 11. Function Calls (e.g. handleSave(), alert())
    const funcMatch = remaining.match(/^([a-zA-Z0-9_]+)(?=\s*\()/);
    if (funcMatch) {
      tokens.push({ type: 'function', text: funcMatch[0] });
      remaining = remaining.slice(funcMatch[0].length);
      continue;
    }

    // 12. Operators & Punctuation
    const opMatch = remaining.match(/^(=>|===|!==|<=|>=|&&|\|\||[{}()[\];:,.<>=+\-*/?&|!])/);
    if (opMatch) {
      tokens.push({ type: 'operator', text: opMatch[0] });
      remaining = remaining.slice(opMatch[0].length);
      continue;
    }

    // 13. Plain Word or Whitespace
    const plainMatch = remaining.match(/^(\s+|[^\s"'`#//<>{}[\]();:,.=+\-*/?&|!]+)/);
    if (plainMatch) {
      tokens.push({ type: 'plain', text: plainMatch[0] });
      remaining = remaining.slice(plainMatch[0].length);
    } else {
      // Fallback single char
      tokens.push({ type: 'plain', text: remaining[0] });
      remaining = remaining.slice(1);
    }
  }

  return tokens;
}

/**
 * Renders highlighted code line by line with line numbers and token coloring.
 */
export function HighlightedCode({ code, language = 'tsx' }: { code: string; language?: string }) {
  const lines = code.trim().split('\n');

  return (
    <span className="doc-highlighted-code">
      {lines.map((line, lineIdx) => {
        const tokens = tokenizeLine(line, language);
        return (
          <span key={lineIdx} className="doc-code-line">
            <span className="doc-code-line-num" aria-hidden="true">
              {lineIdx + 1}
            </span>
            <span className="doc-code-line-content">
              {tokens.map((token, tokenIdx) => (
                <span
                  key={tokenIdx}
                  className={`tok-${token.type}`}
                >
                  {token.text}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}
