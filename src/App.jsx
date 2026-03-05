import { useReducer, useCallback, useMemo, useState } from 'react';
import AppLayout from './components/layout/AppLayout';
import FileUpload from './components/upload/FileUpload';
import CanvasEditor from './components/canvas/CanvasEditor';
import DraggableCropPreview from './components/canvas/DraggableCropPreview';
import ControlPanel from './components/controls/ControlPanel';
import CropControls from './components/controls/CropControls';
import AspectRatioToggle from './components/controls/AspectRatioToggle';
import BackgroundToggle from './components/controls/BackgroundToggle';
import ExportButton from './components/controls/ExportButton';
import Button from './components/ui/Button';
import ConfirmDialog from './components/ui/ConfirmDialog';
import { useCanvasExport } from './hooks/useCanvasExport';
import { calculateCrop } from './utils/canvas/cropCalculations';
import { CROP_PRESETS, ASPECT_RATIOS, FRAME_BACKGROUNDS, DEFAULT_FRAME_PADDING } from './utils/constants';
import { useToast } from './contexts/ToastContext';

// Initial State
const initialState = {
  image: {
    original: null,
    width: 0,
    height: 0,
    naturalWidth: 0,
    naturalHeight: 0,
  },
  crop: {
    preset: CROP_PRESETS.NONE,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    offsetX: 0, // User's manual offset
    offsetY: 0,
  },
  frame: {
    aspectRatio: ASPECT_RATIOS.LANDSCAPE,
    background: FRAME_BACKGROUNDS.BLACK,
    padding: DEFAULT_FRAME_PADDING,
  },
  ui: {
    isLoading: false,
    isExporting: false,
    error: null,
  },
};

// Action Types
const ACTIONS = {
  SET_IMAGE: 'SET_IMAGE',
  UPDATE_CROP: 'UPDATE_CROP',
  SET_CROP_PRESET: 'SET_CROP_PRESET',
  SET_CROP_OFFSET: 'SET_CROP_OFFSET',
  TOGGLE_ASPECT_RATIO: 'TOGGLE_ASPECT_RATIO',
  TOGGLE_BACKGROUND: 'TOGGLE_BACKGROUND',
  SET_LOADING: 'SET_LOADING',
  SET_EXPORTING: 'SET_EXPORTING',
  SET_ERROR: 'SET_ERROR',
  RESET: 'RESET',
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_IMAGE:
      return {
        ...state,
        image: action.payload,
        ui: { ...state.ui, isLoading: false, error: null },
      };

    case ACTIONS.UPDATE_CROP:
      return {
        ...state,
        crop: { ...state.crop, ...action.payload },
      };

    case ACTIONS.SET_CROP_PRESET:
      return {
        ...state,
        crop: { ...state.crop, preset: action.payload, offsetX: 0, offsetY: 0 },
      };

    case ACTIONS.SET_CROP_OFFSET:
      return {
        ...state,
        crop: { ...state.crop, offsetX: action.payload.x, offsetY: action.payload.y },
      };

    case ACTIONS.TOGGLE_ASPECT_RATIO:
      return {
        ...state,
        frame: {
          ...state.frame,
          aspectRatio:
            state.frame.aspectRatio === ASPECT_RATIOS.LANDSCAPE
              ? ASPECT_RATIOS.PORTRAIT
              : ASPECT_RATIOS.LANDSCAPE,
        },
      };

    case ACTIONS.TOGGLE_BACKGROUND:
      return {
        ...state,
        frame: {
          ...state.frame,
          background:
            state.frame.background === FRAME_BACKGROUNDS.BLACK
              ? FRAME_BACKGROUNDS.WHITE
              : FRAME_BACKGROUNDS.BLACK,
        },
      };

    case ACTIONS.SET_LOADING:
      return {
        ...state,
        ui: { ...state.ui, isLoading: action.payload },
      };

    case ACTIONS.SET_EXPORTING:
      return {
        ...state,
        ui: { ...state.ui, isExporting: action.payload },
      };

    case ACTIONS.SET_ERROR:
      return {
        ...state,
        ui: { ...state.ui, error: action.payload, isLoading: false },
      };

    case ACTIONS.RESET:
      return initialState;

    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { isExporting, exportImage } = useCanvasExport();
  const toast = useToast();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleFileLoad = useCallback((imageData) => {
    dispatch({ type: ACTIONS.SET_IMAGE, payload: imageData });
    toast.success('Photo loaded successfully!');
  }, [toast]);

  const handleCropPresetChange = useCallback((preset) => {
    dispatch({ type: ACTIONS.SET_CROP_PRESET, payload: preset });
  }, []);

  const handleAspectRatioToggle = useCallback(() => {
    dispatch({ type: ACTIONS.TOGGLE_ASPECT_RATIO });
  }, []);

  const handleBackgroundToggle = useCallback(() => {
    dispatch({ type: ACTIONS.TOGGLE_BACKGROUND });
  }, []);

  // Calculate current crop for export
  const currentCrop = useMemo(() => {
    if (!state.image.original) return null;
    return calculateCrop(
      state.image.naturalWidth,
      state.image.naturalHeight,
      state.crop.preset,
      state.crop.offsetX,
      state.crop.offsetY
    );
  }, [
    state.image.naturalWidth,
    state.image.naturalHeight,
    state.crop.preset,
    state.crop.offsetX,
    state.crop.offsetY,
  ]);

  const handleExport = useCallback(async () => {
    if (!state.image.original || !currentCrop) return;
    try {
      await exportImage(state.image.original, currentCrop, state.frame);
      toast.success('Photo downloaded successfully!');
    } catch (error) {
      toast.error('Failed to export photo. Please try again.');
    }
  }, [state.image.original, currentCrop, state.frame, exportImage, toast]);

  const handleResetClick = useCallback(() => {
    setShowResetConfirm(true);
  }, []);

  const handleResetConfirm = useCallback(() => {
    setShowResetConfirm(false);
    dispatch({ type: ACTIONS.RESET });
    toast.info('Starting fresh! Upload a new photo.');
  }, [toast]);

  const handleResetCancel = useCallback(() => {
    setShowResetConfirm(false);
  }, []);

  const handleCropOffsetChange = useCallback((offset) => {
    dispatch({ type: ACTIONS.SET_CROP_OFFSET, payload: offset });
  }, []);

  return (
    <AppLayout>
      {state.image.original ? (
        <>
          <CanvasEditor
            imageState={state.image}
            cropState={state.crop}
            frameConfig={state.frame}
          >
            <ControlPanel>
              <CropControls
                currentPreset={state.crop.preset}
                onPresetChange={handleCropPresetChange}
              />
              <AspectRatioToggle
                aspectRatio={state.frame.aspectRatio}
                onToggle={handleAspectRatioToggle}
              />
              <BackgroundToggle
                background={state.frame.background}
                onToggle={handleBackgroundToggle}
              />
              <ExportButton
                onClick={handleExport}
                isExporting={isExporting}
                disabled={!state.image.original}
              />
            </ControlPanel>
            {state.crop.preset !== CROP_PRESETS.NONE && (
              <DraggableCropPreview
                image={state.image.original}
                imageWidth={state.image.naturalWidth}
                imageHeight={state.image.naturalHeight}
                cropPreset={state.crop.preset}
                cropOffset={{ x: state.crop.offsetX, y: state.crop.offsetY }}
                onOffsetChange={handleCropOffsetChange}
              />
            )}
          </CanvasEditor>
          <Button
            onClick={handleResetClick}
            variant="secondary"
            size="medium"
            style={{ marginTop: 'var(--space-lg)' }}
            tooltip="Start over with a new photo"
          >
            Upload New Photo
          </Button>
          <ConfirmDialog
            isOpen={showResetConfirm}
            title="Upload New Photo?"
            message="This will discard your current work. Are you sure you want to start over?"
            confirmLabel="Upload New"
            cancelLabel="Keep Working"
            variant="danger"
            onConfirm={handleResetConfirm}
            onCancel={handleResetCancel}
          />
        </>
      ) : (
        <FileUpload onFileLoad={handleFileLoad} />
      )}
    </AppLayout>
  );
}

export default App;
