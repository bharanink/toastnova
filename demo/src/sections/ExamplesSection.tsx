import React, { useState, useRef } from 'react';
import { toast } from 'toastnova';
import { CodeBlock } from '../components/CodeBlock';
import { ToastLogViewer } from '../components/ToastLogViewer';

export const ExamplesSection: React.FC = () => {
  const [activeUploadId, setActiveUploadId] = useState<string | null>(null);
  const uploadTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 1. Undo Action Example
  const handleUndoExample = () => {
    toast.success('Document "quarterly-report.pdf" moved to trash.', {
      title: 'Item Deleted',
      action: {
        label: 'Undo',
        onClick: () => {
          toast.info('Document "quarterly-report.pdf" restored to your files.', {
            title: 'Action Reverted'
          });
        }
      },
      cancel: {
        label: 'Dismiss',
        onClick: () => {}
      }
    });
  };

  // 2. Real-Time Upload Progress Example
  const handleUploadProgressExample = () => {
    if (uploadTimerRef.current) clearInterval(uploadTimerRef.current);

    let progress = 0;
    const id = toast('Preparing upload buffer...', {
      title: 'File Upload: archive.zip',
      progress: 0,
      duration: Infinity
    });
    setActiveUploadId(id);

    uploadTimerRef.current = setInterval(() => {
      progress += 15;
      if (progress >= 100) {
        if (uploadTimerRef.current) clearInterval(uploadTimerRef.current);
        uploadTimerRef.current = null;
        setActiveUploadId(null);
        toast.update(id, {
          type: 'success',
          title: 'Upload Finished',
          message: '1.4 GB transferred to storage cluster.',
          progress: 100,
          duration: 3500
        });
      } else {
        toast.update(id, {
          progress,
          message: `Transferred ${progress}% (${(progress * 14).toFixed(0)} MB / 1400 MB)`
        });
      }
    }, 300);
  };

  // 3. Concurrent Promises Example
  const handleConcurrentPromisesExample = () => {
    const p1 = new Promise((resolve) => setTimeout(() => resolve('Cache Warm'), 1200));
    const p2 = new Promise((resolve) => setTimeout(() => resolve('Database Sync'), 2400));

    toast.promise(p1, {
      loading: 'Warming CDN edge caches...',
      success: 'CDN caches synchronized!',
      error: 'Cache warmup failed'
    });

    toast.promise(p2, {
      loading: 'Syncing database replicas...',
      success: 'Database read-replicas updated!',
      error: 'Replica sync failed'
    });
  };

  // 4. Duplicate Grouping Example
  const handleDuplicateGroupingExample = () => {
    toast.warning('Incoming request rate spike detected on gateway.', {
      title: 'Rate Limit Warning'
    });
  };

  return (
    <section id="section-examples" className="doc-section">
      <div className="doc-section-header">
        <h2 className="doc-section-title">Advanced Examples &amp; Recipes</h2>
        <p className="doc-section-desc">
          Interactive recipes demonstrating production patterns in ToastNova. Click any button to test live.
        </p>
      </div>

      <div className="doc-examples-grid">
        {/* Undo Action Card */}
        <div className="doc-example-card">
          <div className="doc-example-header">
            <div>
              <h3 className="doc-example-title">1. Reversible Undo Action</h3>
              <p className="doc-example-desc">Attach interactive action and cancel handlers to notifications.</p>
            </div>
            <button
              type="button"
              className="doc-btn doc-btn-secondary"
              onClick={handleUndoExample}
            >
              Test Undo Action
            </button>
          </div>
          <CodeBlock
            language="tsx"
            code={`toast.success('Document moved to trash.', {
  title: 'Item Deleted',
  action: {
    label: 'Undo',
    onClick: () => restoreDocument()
  },
  cancel: {
    label: 'Dismiss',
    onClick: () => {}
  }
});`}
          />
        </div>

        {/* Dynamic Progress Card */}
        <div className="doc-example-card">
          <div className="doc-example-header">
            <div>
              <h3 className="doc-example-title">2. In-Place Progress Stream</h3>
              <p className="doc-example-desc">Update an active notification in-place using <code>toast.update(id, ...)</code>.</p>
            </div>
            <button
              type="button"
              className="doc-btn doc-btn-secondary"
              onClick={handleUploadProgressExample}
            >
              {activeUploadId ? 'Uploading...' : 'Test File Upload'}
            </button>
          </div>
          <CodeBlock
            language="tsx"
            code={`const id = toast('Uploading...', { progress: 0, duration: Infinity });

// Stream progress ticks
toast.update(id, {
  progress: 65,
  message: 'Transferred 65%...'
});

// Finalize upon completion
toast.update(id, {
  type: 'success',
  message: 'Upload complete!',
  progress: 100,
  duration: 3000
});`}
          />
        </div>

        {/* Concurrent Promises */}
        <div className="doc-example-card">
          <div className="doc-example-header">
            <div>
              <h3 className="doc-example-title">3. Concurrent Promises</h3>
              <p className="doc-example-desc">Track multiple simultaneous asynchronous tasks independently.</p>
            </div>
            <button
              type="button"
              className="doc-btn doc-btn-secondary"
              onClick={handleConcurrentPromisesExample}
            >
              Test 2x Promises
            </button>
          </div>
          <CodeBlock
            language="tsx"
            code={`toast.promise(warmCdn(), {
  loading: 'Warming CDN edge caches...',
  success: 'CDN caches synchronized!',
  error: 'Cache warmup failed'
});

toast.promise(syncDb(), {
  loading: 'Syncing database replicas...',
  success: 'Database read-replicas updated!',
  error: 'Replica sync failed'
});`}
          />
        </div>

        {/* Duplicate Grouping */}
        <div className="doc-example-card">
          <div className="doc-example-header">
            <div>
              <h3 className="doc-example-title">4. Duplicate Grouping (Badge Counter)</h3>
              <p className="doc-example-desc">Rapid repeated alerts increment a badge counter rather than spamming the screen.</p>
            </div>
            <button
              type="button"
              className="doc-btn doc-btn-secondary"
              onClick={handleDuplicateGroupingExample}
            >
              Trigger Repeated Alert
            </button>
          </div>
          <CodeBlock
            language="tsx"
            code={`// In your <Toaster duplicateStrategy="group" dedupeWindow={3000} />
// Repeated calls increment a badge counter "×2", "×3" and refresh timeout:
toast.warning('Incoming request rate spike detected on gateway.', {
  title: 'Rate Limit Warning'
});`}
          />
        </div>
      </div>

      {/* Real-time Examples Activity Logs */}
      <ToastLogViewer title="Interactive Examples Activity Logs" defaultExpanded={false} />
    </section>
  );
};
