import { useState, useEffect } from 'react';
import Button from './Button';
import '../../styles/components/Onboarding.css';

const ONBOARDING_STEPS = [
  {
    title: 'Welcome to Photo Framing! 📸',
    description: 'Create beautiful framed photos in seconds. Let me show you how it works.',
  },
  {
    title: 'Upload Your Photo',
    description: 'Drag and drop any photo or click to browse. We support JPG, PNG, HEIC, and WebP formats up to 50MB.',
  },
  {
    title: 'Choose Your Crop',
    description: 'Select a crop preset (16:9 or 9:16) or keep the full image. You can drag the preview to reposition.',
  },
  {
    title: 'Customize Your Frame',
    description: 'Toggle between landscape/portrait frames and black/white backgrounds to match your style.',
  },
  {
    title: 'Download & Share',
    description: 'When you\'re happy with the result, hit Download to save your high-quality framed photo!',
  },
];

const STORAGE_KEY = 'photo-framing-onboarding-completed';

function Onboarding({ onComplete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    // Check if onboarding has been completed
    const hasCompleted = localStorage.getItem(STORAGE_KEY);
    if (!hasCompleted) {
      setIsOpen(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
    setIsOpen(false);
    if (onComplete) {
      onComplete();
    }
  };

  if (!isOpen) return null;

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="onboarding-overlay">
      <div className="onboarding">
        <div className="onboarding__header">
          <div className="onboarding__progress">
            {ONBOARDING_STEPS.map((_, index) => (
              <div
                key={index}
                className={`onboarding__progress-dot ${
                  index === currentStep ? 'onboarding__progress-dot--active' : ''
                } ${index < currentStep ? 'onboarding__progress-dot--completed' : ''}`}
              />
            ))}
          </div>
          <button
            className="onboarding__skip"
            onClick={handleSkip}
            aria-label="Skip onboarding"
          >
            Skip
          </button>
        </div>

        <div className="onboarding__body">
          <h2 className="onboarding__title">{step.title}</h2>
          <p className="onboarding__description">{step.description}</p>
        </div>

        <div className="onboarding__footer">
          <label className="onboarding__checkbox">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
            />
            <span>Don't show this again</span>
          </label>

          <div className="onboarding__actions">
            {!isFirstStep && (
              <Button
                onClick={handlePrevious}
                variant="secondary"
                size="medium"
              >
                Previous
              </Button>
            )}
            <Button
              onClick={handleNext}
              variant="primary"
              size="medium"
            >
              {isLastStep ? 'Get Started' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
