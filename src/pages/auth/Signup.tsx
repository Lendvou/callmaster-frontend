import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Form, Field } from 'react-final-form';
import { Button, Input } from 'antd';
import { FORM_ERROR } from 'final-form';

import FieldWithValidation from 'components/FieldWithValidation';

import { isEmail } from 'utils';
import apiClient from 'utils/apiClient';

import { ValidationErrorsObject } from 'types';

const Signup = () => {
  const history = useHistory();

  const onSubmit = async (values: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    const data = {
      email: values.email,
      password: values.password,
      firstName: values.firstName,
      lastName: values.lastName,
      role: 'client',
    };

    try {
      await apiClient.service('users').create(data);
      history.push('/login');
    } catch (e) {
      console.log('err', e);
      return { [FORM_ERROR]: e.message };
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-layout__container">
        <Form
          onSubmit={onSubmit}
          validate={validate}
          render={({ handleSubmit, submitError, submitting }) => (
            <form
              className="auth-form auth-form--signup"
              onSubmit={handleSubmit}
            >
              <div className="auth-form__title">Sign up</div>

              {submitError && (
                <div className="auth-form__error">{submitError}</div>
              )}

              <div className="auth-form__fields">
                <Field name="firstName">
                  {({ input, meta }) => (
                    <FieldWithValidation meta={meta} errorText={meta.error}>
                      <Input {...input} placeholder="Имя" />
                    </FieldWithValidation>
                  )}
                </Field>
                <Field name="lastName">
                  {({ input, meta }) => (
                    <FieldWithValidation meta={meta} errorText={meta.error}>
                      <Input {...input} placeholder="Фамилия" />
                    </FieldWithValidation>
                  )}
                </Field>
                <Field name="email">
                  {({ input, meta }) => (
                    <FieldWithValidation meta={meta} errorText={meta.error}>
                      <Input {...input} placeholder="Email" />
                    </FieldWithValidation>
                  )}
                </Field>
                <Field name="password">
                  {({ input, meta }) => (
                    <FieldWithValidation meta={meta} errorText={meta.error}>
                      <Input.Password {...input} placeholder="Пароль" />
                    </FieldWithValidation>
                  )}
                </Field>
              </div>

              <Button
                className="auth-form__button"
                type="primary"
                htmlType="submit"
                loading={submitting}
              >
                Зарегистрироваться
              </Button>
              <div className="auth-form__footer-text">
                Есть аккаунт? <Link to="/login">Войти</Link>
              </div>
            </form>
          )}
        />
      </div>
    </div>
  );
};

type FormState = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

const validate = (values: Partial<FormState>) => {
  const errors: ValidationErrorsObject<FormState> = {};

  if (!values.email) {
    errors.email = 'Обязательное поле';
  }
  if (values.email && !isEmail(values.email)) {
    errors.email = 'Введите email правильно';
  }
  if (!values.password || values.password.trim().length < 3) {
    errors.password = 'Введите не менее 6 символов';
  }
  if (!values.firstName) {
    errors.firstName = 'Обязательное поле';
  }
  if (!values.lastName) {
    errors.lastName = 'Обязательное поле';
  }

  return errors;
};

export default Signup;
