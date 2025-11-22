import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { TasksType } from "../../Types/TaskTypes";
import CommentServices from "../../services/CommentServices";
import toast from "react-hot-toast";
import { X, Trash2, Send, Reply } from "lucide-react";

const FALLBACK_AVATAR = "/mnt/data/8e74240e-5478-4c5f-8131-1966cd51f7ed.png";

type UserCompactType = {
  id: number | string;
  first_name?: string;
  last_name?: string;
  username?: string;
  profile_picture?: string | null;
  role?: string;
  email?: string;
};
type ParentPreview = {
  id: string;
  text: string;
  created_by: UserCompactType;
  created_at: string;
  edited_at?: string | null;
};
type CommentType = {
  id: string;
  task: string;
  parent: ParentPreview | null;
  text: string;
  created_by: UserCompactType;
  created_at: string;
  edited_at?: string | null;
  is_deleted?: boolean;
  meta?: any;
  self?: boolean;
};

interface Props {
  onClose: () => void;
  task: TasksType;
}

export default function CommentPopup({ task, onClose }: Props) {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const commentsRef = useRef<HTMLDivElement | null>(null);
  const pollRef = useRef<number | null>(null);

  // track whether viewport is already at bottom (so we don't yank the scroll while user reads)
  const [isAtBottom, setIsAtBottom] = useState(true);
  // used to force scroll right after posting
  const forceScrollRef = useRef(false);

  useEffect(() => {
    if (!task?.id) return;
    setLoading(true);
    loadComments();

    pollRef.current = window.setInterval(() => {
      loadComments();
    }, 8000);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.id]);

  // IMPORTANT: allow flex child to shrink properly (min-h-0), otherwise overflow won't work.
  // See scroll behaviour below.

  // when comments change, if user is at bottom (or we requested a force scroll), scroll to bottom
  useLayoutEffect(() => {
    if (!commentsRef.current) return;
    if (isAtBottom || forceScrollRef.current) {
      // use requestAnimationFrame so DOM has laid out
      requestAnimationFrame(() => {
        const el = commentsRef.current!;
        el.scrollTop = el.scrollHeight;
        forceScrollRef.current = false;
      });
    }
  }, [comments, isAtBottom]);

  async function loadComments() {
    if (!task?.id) {
      return;
    }
    try {
      const res = await CommentServices.FetchComments(task.id);
      setComments(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("error loading comments:", err);
      // swallow repeated poll errors (optional)
    } finally {
      setLoading(false);
    }
  }

  function handleScroll() {
    const el = commentsRef.current;
    if (!el) return;
    // consider near-bottom within 48px as bottom
    const threshold = 48;
    const atBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
    setIsAtBottom(atBottom);
  }

  async function handlePost() {
    if (!task?.id) return toast.error("No task selected");
    if (!text.trim()) return toast.error("Comment cannot be empty");
    setPosting(true);
    try {
      const payload: any = { text: text.trim() };
      if (replyTo) payload.parent = replyTo;
      await CommentServices.PostComment(task.id, payload);

      // after successful post always reload the authoritative list
      // and force scroll-to-bottom once (so user sees their new comment)
      forceScrollRef.current = true;
      await loadComments();
      setText("");
      setReplyTo(null);
      toast.success("Comment posted");
    } catch (err: any) {
      console.error("post comment error", err);
      toast.error(
        (err && (err.detail || err.message)) || "Failed to post comment"
      );
    } finally {
      setPosting(false);
    }
  }

  async function handleDelete(commentId: string) {
    if (!commentId) return;
    if (!confirm("Delete this comment?")) return;
    setDeletingId(commentId);
    try {
      await CommentServices.DeleteComment(commentId);
      forceScrollRef.current = true;
      await loadComments();
      toast.success("Comment deleted");
    } catch (err) {
      console.error("delete comment error", err);
      toast.error("Failed to delete comment");
    } finally {
      setDeletingId(null);
    }
  }

  function startReply(id: string) {
    setReplyTo(id);
    const el = document.getElementById("comment-input");
    if (el) (el as HTMLTextAreaElement).focus();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onClose()}
        aria-hidden
      />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b">
          <div>
            <div className="text-sm text-slate-500">Comments</div>
            <div className="font-semibold text-lg truncate">
              {task?.title || "Task"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setReplyTo(null);
                setText("");
                onClose();
              }}
              className="p-2 rounded hover:bg-slate-100"
              title="Close"
            >
              <X className="w-4 h-4 text-slate-700" />
            </button>
          </div>
        </div>

        {/* comments area: NB `min-h-0` so inner overflow can work in a flex column */}
        <div className="flex-1 min-h-0">
          <div
            ref={commentsRef}
            onScroll={handleScroll}
            className="h-[26rem] pb-14 overflow-y-auto p-4 space-y-3"
          >
            {loading && (
              <div className="text-sm text-slate-500">Loading comments…</div>
            )}
            {!loading && comments.length === 0 && (
              <div className="text-sm text-slate-500">No comments yet.</div>
            )}

            {!loading &&
              comments.map((c) => {
                const isSelf = !!c.self;
                return (
                  <div
                    key={c.id}
                    className={`p-3 rounded-lg border ${
                      isSelf
                        ? "bg-indigo-50 border-indigo-200 self-end"
                        : "bg-slate-50 border-slate-100"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                          {c.created_by?.profile_picture ? (
                            <img
                              src={c.created_by.profile_picture}
                              alt={c.created_by.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-xs font-semibold text-slate-700">
                              {(
                                c.created_by?.first_name?.[0] ||
                                c.created_by?.username?.[0] ||
                                "?"
                              ).toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-slate-900 truncate">
                              {c.created_by?.first_name
                                ? `${c.created_by.first_name} ${
                                    c.created_by.last_name || ""
                                  }`
                                : c.created_by?.username}
                            </div>
                            {isSelf && (
                              <div className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                                you
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-slate-500">
                            {new Date(c.created_at).toLocaleString()}
                            {c.edited_at ? " • edited" : ""}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startReply(c.id)}
                          title="Reply"
                          className="p-1 rounded hover:bg-slate-100"
                        >
                          <Reply className="w-4 h-4 text-slate-600" />
                        </button>
                        {c.self && (
                          <button
                            onClick={() => handleDelete(c.id)}
                            disabled={deletingId === c.id}
                            title="Delete"
                            className="p-1 rounded hover:bg-red-50 text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {c.parent && (
                      <div className="mt-3 p-3 rounded-md bg-white border border-slate-100 text-xs text-slate-600">
                        <div className="font-semibold text-xs text-slate-700 truncate">
                          Replying to{" "}
                          {c.parent.created_by?.first_name
                            ? `${c.parent.created_by.first_name} ${
                                c.parent.created_by.last_name || ""
                              }`
                            : c.parent.created_by?.username}
                          <span className="ml-2 text-xs text-slate-400">
                            • {new Date(c.parent.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="mt-1 truncate">{c.parent.text}</div>
                      </div>
                    )}

                    <div className="mt-3 text-sm text-slate-700 whitespace-pre-wrap">
                      {c.text}
                    </div>
                  </div>
                );
              })}
            <p className="text-center w-full text-gray-400 text-[10px]">End</p>
          </div>
        </div>

        {/* input area (sticky bottom) */}
        <div className="border-t p-3 bg-white">
          {replyTo && (
            <div className="mb-2 text-xs text-slate-500 flex items-center justify-between">
              <div>
                Replying to{" "}
                <span className="font-medium">
                  {comments.find((c) => c.id === replyTo)?.created_by
                    ?.username || "comment"}
                </span>
              </div>
              <button
                onClick={() => setReplyTo(null)}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="flex gap-2 items-start">
            <textarea
              id="comment-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a comment..."
              rows={2}
              className="flex-1 px-3 py-2 rounded-md border resize-none text-sm focus:outline-none focus:ring"
            />
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={() => {
                  setText("");
                  setReplyTo(null);
                }}
                className="px-3 py-1 rounded-md border text-sm"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handlePost}
                disabled={posting || !text.trim()}
                className="px-3 py-1 rounded-md bg-slate-900 text-white text-sm disabled:opacity-50"
                type="button"
              >
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  <span>{posting ? "Posting..." : "Post"}</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
