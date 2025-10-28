import './FeedbackButton.css';

interface FeedbackButtonProps {
  onClick?: () => void;
}

/**
 * Feedback button component
 * 显示一个反馈按钮，用户可以点击提供反馈
 */
export function FeedbackButton({ onClick }: FeedbackButtonProps) {
  const handleClick = () => {
    console.log('Feedback button clicked');
    onClick?.();
  };

  return (
    <div className="feedback-button-wrapper">
      <div className="feedback-button" onClick={handleClick}>
        <img
          src="/assets/github.svg"
          alt="Feedback"
          className="feedback-icon"
        />
        <span className="feedback-text">Give Feedback</span>
      </div>
      <div className="feedback-bottom-bar"></div>
    </div>
  );
}
