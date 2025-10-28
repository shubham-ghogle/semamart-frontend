import { useEffect, useState } from "react"
import { useBlocker } from "react-router" // you already use `useBlocker`
/**
 * useBeforeUnload - keeps native browser dialog for tab/refresh/close
 * (note: custom messages are ignored by most browsers; they show a default text)
 */
export function useBeforeUnload(when: boolean) {
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!when) return;
      event.preventDefault();
      // Some browsers require setting returnValue to show the dialog.
      event.returnValue = "";
      return "";
    };

    if (when) window.addEventListener("beforeunload", handleBeforeUnload);
    else window.removeEventListener("beforeunload", handleBeforeUnload);

    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [when]);
}

/**
 * NavigationBlocker component
 * - when: boolean that indicates whether to block navigation
 * - message: message to show inside the custom modal
 *
 * Usage: render <NavigationBlocker when={isDirty} message="You have unsaved changes…" />
 */
type NavigationBlockerProps = {
  when: boolean
  message?: string
}

export function NavigationBlocker({ when, message = "You have unsaved changes. Are you sure you want to leave?" }: NavigationBlockerProps) {
  const blocker = useBlocker(when)
  const [show, setShow] = useState(false)
  const [pendingBlocker, setPendingBlocker] = useState<any>(null) // store blocker instance

  // watch blocker state from react-router
  useEffect(() => {
    if (!when) {
      // if blocking switched off, and there was a pending blocker, reset it
      setPendingBlocker(null)
      setShow(false)
    }

    if (blocker?.state === "blocked") {
      // store the blocker so we can call proceed() or reset()
      setPendingBlocker(blocker)
      setShow(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocker, when])

  const handleStay = () => {
    if (pendingBlocker?.reset) pendingBlocker.reset()
    setShow(false)
    setPendingBlocker(null)
  }

  const handleLeave = () => {
    // allow the pending navigation to continue
    if (pendingBlocker?.proceed) pendingBlocker.proceed()
    setShow(false)
    setPendingBlocker(null)
  }

  // If not showing modal, render nothing
  if (!show) return null

  // Simple accessible modal (no external libs). You can swap for your Dialog component.
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleStay}
        aria-hidden
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-t-xl sm:rounded-xl shadow-lg overflow-hidden m-0 sm:m-auto">
        <div className="p-4 border-b">
          <h3 className="text-sm font-semibold">Unsaved changes</h3>
        </div>

        <div className="p-4">
          <p className="text-sm text-muted-foreground">{message}</p>

          <div className="mt-3 grid grid-cols-1 gap-2 sm:flex sm:justify-end sm:gap-2">
            <button
              onClick={handleStay}
              className="w-full sm:w-auto inline-flex justify-center items-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Stay
            </button>

            <button
              onClick={handleLeave}
              className="w-full sm:w-auto inline-flex justify-center items-center rounded-md bg-red-600 text-white px-3 py-2 text-sm font-medium hover:bg-red-700"
            >
              Leave page
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
