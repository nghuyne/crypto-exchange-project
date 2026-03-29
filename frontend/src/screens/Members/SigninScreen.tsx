import { useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';

// hooks
import useFormEvents from '../../hooks/useFormEvents';

// components
import Box from '../../components/Common/Box';
import MainLayout from '../../layouts/MainLayout';
import FormInput from '../../components/Forms/FormInput';
import FormButton from '../../components/Forms/FormButton';

// interfaces
interface IFormProps {
  email: string;
  password: string;
}

const SigninScreen: React.FC = () => {
  const navigate = useNavigate();

  const { onlyNumbers } = useFormEvents();

  const [formValues, setFormValues] = useState<IFormProps>({
    email: '',
    password: '',
  });

  /**
   * Handles input changes in the sign-in form.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   * @returns {void}
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;

    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  /**
   * Handles the form submission for the sign-in screen.
   * Goi API POST /api/v1/login, luu JWT vao localStorage.
   *
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   * @returns {Promise<void>}
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!formValues.email || !formValues.password) {
      alert('Vui long nhap Email va Password!');
      return;
    }

    try {
      const response = await fetch('/api/v1/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:    formValues.email,
          password: formValues.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.data.token);
        navigate('/market');
      } else {
        alert(`Loi dang nhap: ${data.message}`);
      }
    } catch {
      alert('Khong the ket noi Backend. Hay chay may chu Go (port 8080) truoc!');
    }
  };

  return (
    <MainLayout>
      <div className='flex flex-center full-height'>
        <div className='login no-select'>
          <Box>
            <div className='box-vertical-padding box-horizontal-padding'>
              <div>
                <div className='form-logo center'>
                  <img
                    draggable='false'
                    alt='Crypto Exchange'
                    src={`${process.env.PUBLIC_URL}/images/logo.png`}
                  />
                </div>
                <h1 className='form-title center'>Sign in</h1>
                <p className='form-desc center'>
                  Please make sure that <strong>https://pro.cryptoexchange.com</strong> is written
                  in your browser's address bar.
                </p>
                <form noValidate className='form' onSubmit={handleSubmit}>
                  <div className='form-elements'>
                    <div className='form-line'>
                      <div className='full-width'>
                        <label htmlFor='email'>Email address</label>
                        <FormInput
                          type='email'
                          name='email'
                          onChange={handleChange}
                          value={formValues.email}
                          placeholder='Enter your email address'
                        />
                      </div>
                    </div>
                    <div className='form-line'>
                      <div className='full-width'>
                        <label htmlFor='password'>Password</label>
                        <FormInput
                          type='password'
                          name='password'
                          onChange={handleChange}
                          value={formValues.password}
                          placeholder='Enter your password'
                        />
                      </div>
                    </div>
                    <div className='form-line'>
                      <div className='full-width right'>
                        <Link to='/members/forgot-password'>Forgot password</Link>
                      </div>
                    </div>
                    <div className='form-line'>
                      <div className='buttons'>
                        <FormButton text='Sign in' />
                      </div>
                    </div>
                    <div className='form-line'>
                      <div className='center'>
                        <p>
                          If you don't have an account, create a{' '}
                          <Link to='/members/signup'>new account</Link>.
                        </p>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </Box>
        </div>
      </div>
    </MainLayout>
  );
};

export default SigninScreen;
