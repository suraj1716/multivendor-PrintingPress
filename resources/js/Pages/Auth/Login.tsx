import { useRef } from 'react';
import { createPortal } from 'react-dom';
import Checkbox from '@/Components/Core/Checkbox';
import InputError from '@/Components/Core/InputError';
import PrimaryButton from '@/Components/Core/PrimaryButton';
import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';

export default function LoginModal({
    isOpen,
    onClose,
    status,
    canResetPassword = true,
}: {
    isOpen: boolean;
    onClose: () => void;
    status?: string;
    canResetPassword?: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm<{
        email: string;
        password: string;
        remember: boolean;
    }>({
        email: '',
        password: '',
        remember: false,
    });

    const modalRef = useRef<HTMLDivElement>(null);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => {
                reset('password');
                onClose();
            },
        });
    };

    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // Close modal only if click outside modal content
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            onClose();
        }
    };

    const modalContent = (
        <div
            onClick={handleOverlayClick}
            className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-sm flex items-center justify-center px-4"
        >
            <div
                ref={modalRef}
                onClick={(e) => e.stopPropagation()} // Prevent closing on modal click
                className="relative bg-white shadow-xl rounded-2xl max-w-md w-full p-8"
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl font-bold"
                    aria-label="Close modal"
                >
                    &times;
                </button>

                <Head title="Log in" />

                <h2 className="text-2xl font-semibold text-center mb-4">Login</h2>

                {status && (
                    <div className="mb-4 text-sm font-medium text-green-600">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-5">
                    <div className="relative">
                        <input
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            value={data.email}
                            id="email"
                            name="email"
                            type="text"
                            className="peer placeholder-transparent h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-cyan-600"
                            placeholder="Email address"
                        />
                        <label
                            htmlFor="email"
                            className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-gray-600"
                        >
                            Email Address
                        </label>
                        <InputError message={errors.email} className="mt-1" />
                    </div>

                    <div className="relative">
                        <input
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            value={data.password}
                            id="password"
                            name="password"
                            type="password"
                            className="peer placeholder-transparent h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-cyan-600"
                            placeholder="Password"
                        />
                        <label
                            htmlFor="password"
                            className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-gray-600"
                        >
                            Password
                        </label>
                        <InputError message={errors.password} className="mt-1" />
                    </div>

                    <div className="block">
                        <label className="flex items-center">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) =>
                                    setData('remember', e.target.checked)
                                }
                            />
                            <span className="ml-2 text-sm text-gray-600">Remember me</span>
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-sm text-cyan-600 hover:underline"
                            >
                                Forgot your password?
                            </Link>
                        )}
                    </div>

                    <PrimaryButton className="w-full" disabled={processing}>
                        Log in
                    </PrimaryButton>
                </form>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
