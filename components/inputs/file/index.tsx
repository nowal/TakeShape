import { ChangeEvent, FC, useState, ReactNode } from 'react';
import { MotionValue } from 'framer-motion';
import {
  CvaInput,
  TCvaInputProps,
} from '@/components/cva/input';
import { MarchingAnts } from '@/components/inputs/marching-ants';
import { IconsUpload } from '@/components/icons/upload';
import { cx } from 'class-variance-authority';

export type TInputsFileProps = Partial<TCvaInputProps> & {
  title: string;
  onFile(file: File): void;
  isValue?: boolean;
  titleClassValue?: `typography-file-${'md' | 'sm' | 'xs'}`;
  isRequired?: boolean;
  children?: ReactNode | MotionValue<number> | MotionValue<string>;
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
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFile(file);
    }
  };

  // Convert MotionValue to ReactNode if needed
  const renderChildren = () => {
    if (children instanceof MotionValue) {
      return children.get();
    }
    return children;
  };

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
        <div
          className={cx(
            'relative text-left',
            titleClassValue ?? 'typography-file-md'
          )}
        >
          {title}
          {!isRequired && (
            <div className="text-xs text-gray">(optional)</div>
          )}
        </div>
        {renderChildren()}
      </CvaInput>
      <MarchingAnts isFocus={isFocus} borderRadius="8px" />
    </>
  );
};