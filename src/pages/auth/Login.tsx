import React, { useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Button, Input } from 'antd';
import { Form, Field } from 'react-final-form';
import { FORM_ERROR } from 'final-form';

import FieldWithValidation from 'components/FieldWithValidation';

import { isUserAuth, isEmail, setAuthData } from 'utils';
import apiClient from 'utils/apiClient';

import { ValidationErrorsObject } from 'types';
import { useDataContext } from 'DataContext';

const Login = () => {
  const history = useHistory();
  const { setUser } = useDataContext();

  const onSubmit = async (values: { email: string; password: string }) => {
    try {
      const { accessToken, user } = await apiClient.authenticate({
        email: values.email,
        password: values.password,
        strategy: 'local',
      });
      setAuthData({ user, accessToken });
      setUser(user);

      history.push('/chat');
    } catch (e) {
      return { [FORM_ERROR]: e.message };
    }
  };

  useEffect(() => {
    if (isUserAuth()) {
      history.push('/');
    }
  }, []);

  return (
    <div className="auth-form">
      <Form
        onSubmit={onSubmit}
        validate={validate}
        render={({ handleSubmit, submitError, submitting }) => (
          <form className="auth-form auth-form--login" onSubmit={handleSubmit}>
            <div className="auth-form__title">Вход</div>

            {submitError && (
              <div className="auth-form__error">{submitError}</div>
            )}

            <div className="auth-form__fields">
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

            {/* <Link to="/forgot-password" className="auth-form__forgot">
                  Забыли пароль?
                </Link> */}
            <Button
              className="auth-form__button"
              type="primary"
              htmlType="submit"
              loading={submitting}
            >
              Войти
            </Button>
            <div className="auth-form__footer-text">
              Все ещё нет аккаунта? <Link to="/signup">Зарегистрироваться</Link>
            </div>
          </form>
        )}
      />
    </div>
  );
};

type FormState = {
  email: string;
  password: string;
};

const validate = (values: Partial<FormState>) => {
  const errors: ValidationErrorsObject<FormState> = {};

  if (!values.email) {
    errors.email = 'Обязательное поле';
  }
  if (values.email && !isEmail(values.email)) {
    errors.email = 'Введите email правильно';
  }
  if (!values.password || values.password.trim().length <= 6) {
    errors.password = 'Введите не менее 6 символов';
  }

  return errors;
};

export default Login;
