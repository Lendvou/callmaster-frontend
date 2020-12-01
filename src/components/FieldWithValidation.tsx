import React from 'react';
import clsx from 'clsx';

import { FieldState } from 'final-form';

type Props = {
  meta: Partial<FieldState<any>>;
  errorText?: string;
};

const FieldWithValidation: React.FC<Props> = ({
  meta,
  errorText,
  children,
}) => {
  return (
    <div
      className={clsx('field-with-validation', {
        'field-with-validation--invalid': meta.error && meta.touched,
      })}
    >
      {errorText && meta.error && meta.touched && (
        <span className="field-with-validation__error-text">{errorText}</span>
      )}
      {children}
    </div>
  );
};

export default FieldWithValidation;
