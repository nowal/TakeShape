import { ChangeEvent, FC, useState, ReactNode } from 'react';
import { CvaInput, TCvaInputProps } from '@/components/cva/input';
import { MarchingAnts } from '@/components/inputs/marching-ants';
import { IconsUpload } from '@/components/icons/upload';
import { cx } from 'class-variance-authority';
import { ARCapture, PoseData } from './ARCapture';  // Updated import path

export type TInputsFileProps = Partial<TCvaInputProps> & {
  title: string;
  onFile(file: File, poseData?: PoseData[]): void;
  isValue?: boolean;
  titleClassValue?: `typography-file-${'md' | 'sm' | 'xs'}`;
  isRequired?: boolean;
  children?: ReactNode;  // Explicitly type children
};

export const InputsFile: FC<TInputsFileProps> = ({
  titleClassValue,
  classValue,
  onFile,
  inputProps,
  title,
  isValue,
  isRequired,
  children,
  ...props
}) => {
  const [isFocus, setFocus] = useState(false);
  const [isRecording, setIsRecording] = useState<boolean | undefined>();
  const [isMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFile(file);
    }
  };

  const handleARCapture = (file: File, poseData: PoseData[]) => {
    setIsRecording(false);
    onFile(file, poseData);
  };

  const handleARClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsRecording(true);
  };

  const renderContent = () => (
    <>
      <div className={cx('relative text-left', titleClassValue ?? 'typography-file-md')}>
        {title}
        {!isRequired && <div className="text-xs text-gray">(optional)</div>}
      </div>
      {children}
      {isMobile && (
        <button
          onClick={handleARClick}
          className={cx(
            'absolute bottom-2 left-2 z-10',
            'rounded-md px-2 py-1',
            'bg-white/10 backdrop-blur-sm',
            'hover:bg-white/20 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-pink/50'
          )}
          type="button"
        >
          <ARCapture onCapture={handleARCapture} isRecording={isRecording} />
        </button>
      )}
    </>
  );

  return (
    <>
      <CvaInput
        classValue={cx('px-6', classValue)}
        inputProps={{
          type: 'file',
          accept: 'video/*',
          onChange: handleChange,
          onMouseEnter: () => setFocus(true),
          onMouseLeave: () => setFocus(false),
          onPointerEnter: () => setFocus(true),
          onPointerLeave: () => setFocus(false),
          onDragEnter: () => setFocus(true),
          onDragOver: () => setFocus(true),
          onDragLeave: () => setFocus(false),
          onDragEnd: () => setFocus(false),
          onDragExit: () => setFocus(false),
          onDrop: () => setFocus(false),
          ...inputProps,
        }}
        intent={isValue ? 'ghost' : 'ghost-1'}
        size="fill"
        rounded="lg"
        icon={{ Leading: IconsUpload }}
        center
        aria-required={isRequired}
        {...props}
      >
        {renderContent()}
      </CvaInput>
      <MarchingAnts isFocus={isFocus} borderRadius="8px" />
    </>
  );
};