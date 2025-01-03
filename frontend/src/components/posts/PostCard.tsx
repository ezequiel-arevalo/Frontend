import React, { useState } from 'react';
import axios from 'axios';
import moment from 'moment';

type User = {
  _id: string;
  username: string;
  profileImage?: string;
  educationLevel?: string; 
  academicYear?: string; 
};

type CommentType = {
  _id: string;
  user: User;
  text: string;
  timestamp: string;
};

type PostType = {
  _id: string;
  user: User;
  text: string;
  img?: string;
  likes: string[];
  comments: CommentType[];
  createdAt: string;
};

type PostCardProps = {
  post: PostType;
  currentUser: User;
  token: string;
};

const PostCard: React.FC<PostCardProps> = ({ post, currentUser, token }) => {
  const [likes, setLikes] = useState<string[]>(post.likes || []);
  const [hasLiked, setHasLiked] = useState<boolean>(likes.includes(currentUser._id));
  const [comments, setComments] = useState<CommentType[]>(post.comments || []);
  const [showComments, setShowComments] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>('');
  const [likeLoading, setLikeLoading] = useState<boolean>(false);
  const [commentLoading, setCommentLoading] = useState<boolean>(false);
  const [showPopOut, setShowPopOut] = useState<boolean>(false);
  const [isDeleted, setIsDeleted] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  const showDeleteButton = currentUser._id === post.user._id;

  const handleLike = async () => {
    setLikeLoading(true);
    try {
      await axios.post(
        `http://localhost:3000/api/posts/like/${post._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setLikes((prevLikes) =>
        hasLiked ? prevLikes.filter((id) => id !== currentUser._id) : [...prevLikes, currentUser._id]
      );
      setHasLiked(!hasLiked);
    } catch (error) {
      console.error('Error liking/unliking post:', error);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:3000/api/posts/comment/${post._id}`,
        { text: commentText },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setComments(response.data.comments || []);
      setCommentText('');
    } catch (error) {
      console.error('Error commenting on post:', error);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleExport = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowPopOut(true); // Show the pop-out message
    setTimeout(() => setShowPopOut(false), 3000); // Hide the message after 3 seconds
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:3000/api/posts/${post._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setIsDeleted(true); // Hide the post after deletion
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  if (isDeleted) {
    return null; // Do not render if deleted
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6 border border-gray-200 relative">
      {/* Header */}
      <div className="flex items-center">
        
        <img
          src={post.user.profileImage ? post.user.profileImage : 'src/assets/DemoProfileImage.png'}
          alt={post.user.username}
          className="w-12 h-12 rounded-full object-cover"
        />

        <div className="ml-4">
          <p className="font-semibold text-gray-800">
            {post.user.username}
            <span className="text-gray-500 text-sm ml-2">
              {post.user.educationLevel && `${post.user.educationLevel}, `}
              {post.user.academicYear ? `Year ${post.user.academicYear}` : ''}
            </span>
          </p>
          <p className="text-gray-500 text-sm">{moment(post.createdAt).fromNow()}</p>
        </div>
      </div>

      {showDeleteButton && (
        <>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="absolute top-4 right-4 text-red-500 hover:text-red-700"
            title="Delete Post"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {showDeleteConfirm && (
            <div className="absolute top-14 right-4 bg-white border border-gray-300 p-4 rounded-md shadow-lg z-10">
              <p className="text-gray-800 mb-4">Are you sure you want to delete this post?</p>
              <div className="flex space-x-4">
                <button
                  onClick={handleDelete}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Post Content */}
      <div className="mt-4">
        <p className="text-gray-700">{post.text}</p>
        {post.img && (
          <img
            src={post.img}
            alt="Post"
            className="mt-4 rounded-lg w-full h-auto object-cover border"
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center mt-4 text-gray-600 space-x-8">
        {/* Like Button */}
        <button
          onClick={handleLike}
          disabled={likeLoading}
          className={`flex items-center space-x-1 hover:text-[#7EB698] ${
            hasLiked ? 'text-[#7EB698]' : ''
          }`}
        >
          <img
            src={hasLiked ? 'src/assets/thumb_up_after.png' : 'src/assets/thumb_up_before.png'}
            alt="Like"
            className="w-5 h-5"
          />
          <span>{likes.length}</span>
        </button>

        {/* Comment Button */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-1 hover:text-[#7EB698]"
        >
          <img
            src="src/assets/comment.png"
            alt="Comment"
            className="w-5 h-5"
          />
          <span>{comments.length}</span>
        </button>
        {/* Export Button */}
        <button
          onClick={handleExport}
          className="flex items-center space-x-1 hover:text-[#7EB698] text-gray-500"
        >
          <img
            src="src/assets/export.png"
            alt="Export"
            className="w-5 h-5"
          />
          <span>Export</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-6">
          <form onSubmit={handleCommentSubmit} className="flex items-center space-x-2">
            <img
              src={currentUser.profileImage || 'src/assets/DemoProfileImage.png'}
              alt={currentUser.username}
              className="w-8 h-8 rounded-full object-cover"
            />

            <input
              type="text"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 border rounded-lg px-4 py-2"
            />
            <button
              type="submit"
              disabled={commentLoading}
              className="text-[#7EB698] font-semibold"
            >
              {commentLoading ? 'Posting...' : 'Post'}
            </button>
          </form>
          <div className="mt-4 space-y-4">
            {comments.map((comment) => (
              <div key={comment._id} className="flex items-start space-x-2">
                <img
                  src={comment.user.profileImage ? comment.user.profileImage : 'src/assets/DemoProfileImage.png'}
                  alt={comment.user.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-800">{comment.user.username}</p>
                  <p className="text-gray-600">{comment.text}</p>
                  <p className="text-gray-400 text-sm">{moment(comment.timestamp).fromNow()}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* Pop-Out Message */}
      {showPopOut && (
        <div className="absolute top-2 right-2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-md">
          URL is copied to your clipboard!
        </div>
      )}
    </div>
  );
};

export default PostCard;
