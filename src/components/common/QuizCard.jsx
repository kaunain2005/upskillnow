import React from 'react';
import { Trash2, Edit, Book, ListChecks } from 'lucide-react';

/**
 * Reusable component to display a single Quiz item with conditional action buttons.
 * @param {object} props
 * @param {object} props.quiz - The quiz data object, now containing nested populated data (chapterId, chapterId.courseId).
 * @param {boolean} props.showDeleteButton - Whether to display the Delete button.
 * @param {boolean} props.showUpdateButton - Whether to display the Update button.
 * @param {function} props.onDelete - Handler for the delete action.
 * @param {function} props.onUpdate - Handler for the update action (simulates navigation/modal).
 */
const QuizCard = ({ quiz, showDeleteButton, showUpdateButton, onDelete, onUpdate }) => {
  
  // 💡 FIX: Destructure the quiz object based on the populated structure from the API.
  // We use optional chaining (?) in case the data is still loading or partially missing.

  console.log("QuizCard received quiz data:", quiz);
  const title = quiz.title;
  const description = quiz.description;
  const numQuestions = quiz.numQuestions || quiz.questions?.length || 'N/A'; // Assuming you might have numQuestions or just questions array
  
  // Navigate the nested populated structure:
  const chapterTitle = quiz.chapterId;
  const courseInfo = quiz.chapterId?.courseId;

  // Fallback values for safety
  const dep = quiz?.department || 'N/A';
  const year = quiz?.year || 'N/A';
  const semester = quiz?.semester || 'N/A';
  const chapter = chapterTitle || 'Chapter Info Missing';
  
  // Determine if any button is visible to render the button container
  const showActions = showUpdateButton || showDeleteButton;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 flex flex-col justify-between transition duration-200 hover:shadow-xl border-t-4 border-indigo-500 h-full">
      
      {/* Quiz Details - Takes up available space */}
      <div className="w-full mb-4">
        <h3 className="text-xl font-bold text-indigo-700 dark:text-indigo-400 truncate hover:text-clip">
          {title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{description}</p>
        
        {/* Metadata Badges - NOW USING DIRECTLY DESTRUCTURED/NAVIGATED VALUES */}
        <div className="flex flex-wrap gap-2 text-xs font-medium mt-3">
          <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 px-3 py-1 rounded-full">
            {dep} ({year}/{semester})
          </span>
          <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-3 py-1 rounded-full flex items-center">
            <ListChecks className="w-3 h-3 mr-1" /> {numQuestions} Qs
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 flex items-center">
            <Book className="w-4 h-4 mr-1 text-indigo-400" />
            {chapter}
        </p>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="w-full flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-4 border-t border-gray-100 dark:border-gray-700">
          
          {showUpdateButton && (
            <button
              onClick={() => onUpdate(quiz._id)}
              className="flex items-center justify-center p-3 text-sm font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition duration-150 shadow-md w-full"
              aria-label={`Update quiz: ${title}`}
            >
              <Edit className="w-4 h-4 mr-1" /> Update
            </button>
          )}
          
          {showDeleteButton && (
            <button
              onClick={() => onDelete(quiz._id)}
              className="flex items-center justify-center p-3 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg transition duration-150 shadow-md w-full"
              aria-label={`Delete quiz: ${title}`}
            >
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizCard;