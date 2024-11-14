import { useCallback, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { FiLoader } from 'react-icons/fi';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import Input from '../../../components/inputs/Input';
import Button from '../../../components/Button';
import { LoginFormType, loginSchema } from '../validations/loginSchema';
import { RegisterFormType, registerSchema } from '../validations/registerSchema';
import { useLoginMutation, useRegisterMutation } from '../../../services/apis/authApiSlice';
import { useAuth } from '../../../providers/AuthProvider';
import toast from 'react-hot-toast';

type Variant = 'LOGIN' | 'REGISTER';

const AuthForm = () => {
    const [variant, setVariant] = useState<Variant>('LOGIN');
    const navigate = useNavigate();
    const { login: loginContext } = useAuth();

    // THIS IS a RTK Query mutations
    const [login, { isLoading: isLoginLoading }] = useLoginMutation();
    const [register, { isLoading: isRegisterLoading }] = useRegisterMutation();

    const isLoading = isLoginLoading || isRegisterLoading;

    const {
        register: registerForm,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<LoginFormType | RegisterFormType>({
        resolver: zodResolver(variant === 'LOGIN' ? loginSchema : registerSchema),
    });

    const toggleVariant = useCallback(() => {
        reset();
        setVariant((prev) => (prev === 'LOGIN' ? 'REGISTER' : 'LOGIN'));
    }, [reset]);

    const onSubmit: SubmitHandler<LoginFormType | RegisterFormType> = async (data) => {
        try {
            if (variant === 'LOGIN') {
                const response = await login(data as LoginFormType).unwrap();
                console.log(response)
                if (response?.user) {
                    loginContext(response.token, response.user);
                    navigate('/');
                } else {
                    throw new Error('User data is missing');
                }
            } else {
                const { email, password, username } = data as RegisterFormType;
                const response = await register({ email, password, username }).unwrap();
                console.log(response);
                toast.success('Regester Succssfully')
                setVariant('LOGIN');
            }
        } catch (error: any) {
            console.error(error?.data?.message || error.message || 'Authentication failed');
            alert(error?.data?.message || error.message || 'Authentication failed');
        }
    };





    return (
        <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
            <div className='bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10'>
                <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>


                    {/* REGISTER Variant Fields */}
                    {variant === 'REGISTER' && (
                        <Input
                            disabled={isLoading}
                            register={registerForm}
                            errors={errors}
                            required={false}
                            id='username'
                            label='Username'
                        />
                    )}

                    <Input
                        disabled={isLoading}
                        register={registerForm}
                        errors={errors}
                        required={true}
                        id='email'
                        label='Email address'
                        type='email'
                    />
                    <Input
                        disabled={isLoading}
                        register={registerForm}
                        errors={errors}
                        required={true}
                        id='password'
                        label='Password'
                        type='password'
                    />

                    {/* REGISTER Variant Fields */}
                    {variant === 'REGISTER' && (
                        <Input
                            disabled={isLoading}
                            register={registerForm}
                            errors={errors}
                            required={true}
                            id='confirmPassword'
                            label='Confirm Password'
                            type='password'
                        />
                    )}
                    <div>
                        <Button
                            disabled={isLoading}
                            fullWidth
                            type='submit'
                            style='flex items-center gap-x-2'
                        >
                            {variant === 'LOGIN' ? 'Sign in' : 'Register'}
                            {isLoading && <FiLoader className='animate-spin' />}
                        </Button>
                    </div>
                </form>

                <div className='mt-6'>
                    <div className='relative'>
                        <div className='absolute inset-0 flex items-center'>
                            <div className='w-full border-t border-gray-300' />
                        </div>
                        <div className='relative flex justify-center text-sm'>
                            <span className='bg-white px-2 text-gray-500'>
                                Or continue with
                            </span>
                        </div>
                    </div>
                </div>

                <div className='flex gap-2 justify-center text-sm mt-6 px-2 text-gray-500'>
                    <div>
                        {variant === 'LOGIN'
                            ? 'New to Messenger?'
                            : 'Already have an account?'}
                    </div>
                    <div onClick={toggleVariant} className='underline cursor-pointer'>
                        {variant === 'LOGIN' ? 'Create an account' : 'Login'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthForm;