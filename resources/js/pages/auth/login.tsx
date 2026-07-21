import { Form, Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import PasskeyVerify from '@/components/passkey-verify';
import TeamInvitationAlert from '@/components/team-invitation-alert';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import type { TeamInvitationContext } from '@/types';

type Props = {
    status?: string;
    canResetPassword: boolean;
    teamInvitation?: TeamInvitationContext | null;
};

export default function Login({
    status,
    canResetPassword,
    teamInvitation,
}: Props) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <>
            <Head>
                <title>SIAKAD | Login</title>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
            </Head>

            <div className="relative flex items-center justify-center min-h-screen bg-[#f4f6fb] text-[#182449] font-sans p-5 bg-[radial-gradient(circle_at_10%_20%,rgba(0,204,163,0.06)_0%,transparent_40%),radial-gradient(circle_at_90%_80%,rgba(20,184,166,0.05)_0%,transparent_40%)]">
                <div className="bg-white border border-[#e8ecf5] rounded-[16px] w-full max-w-[420px] py-10 px-8 shadow-[0_10px_30px_rgba(24,36,73,0.04)] z-10">
                    <div className="flex flex-col items-center text-center mb-8">
                        <img
                            src="/images/logo.png"
                            alt="Logo"
                            className="w-14 h-14 object-contain mb-4"
                        />
                        <h2 className="font-poppins text-[24px] font-bold text-[#182449] m-0 mb-1.5">Siakad</h2>
                        <p className="text-[14px] text-[#7c869c] m-0">Sistem Informasi Akademik</p>
                    </div>

                    {status && (
                        <div className="bg-[#e6faf6] text-[#14b8a6] p-2.5 rounded-[8px] text-[13px] text-center mb-4 font-medium">
                            {status}
                        </div>
                    )}

                    {teamInvitation && (
                        <TeamInvitationAlert
                            invitation={teamInvitation}
                            action="Log in"
                        />
                    )}

                    {/* <PasskeyVerify /> */}

                    <Form
                        {...store.form()}
                        resetOnSuccess={['password']}
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="mb-5 flex flex-col gap-1.5">
                                    <label className="text-[13px] font-semibold text-[#3b4868]" htmlFor="email">Email</label>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="example@gmail.com"
                                        className="w-full py-3 px-4 rounded-[10px] border border-[#e8ecf5] bg-[#fbfcfe] text-[14px] outline-none transition-all duration-150 text-[#182449] focus:border-[#00cca3] focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,204,163,0.1)] box-border"
                                    />
                                    {errors.email && (
                                        <div className="text-[#e35d6a] text-[12px] mt-1 font-medium">{errors.email}</div>
                                    )}
                                </div>

                                <div className="mb-5 flex flex-col gap-1.5">
                                    <label className="text-[13px] font-semibold text-[#3b4868]" htmlFor="password">Kata Sandi</label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            required
                                            tabIndex={2}
                                            autoComplete="current-password"
                                            placeholder="••••••"
                                            className="w-full py-3 pl-4 pr-10 rounded-[10px] border border-[#e8ecf5] bg-[#fbfcfe] text-[14px] outline-none transition-all duration-150 text-[#182449] focus:border-[#00cca3] focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,204,163,0.1)] box-border"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-none border-none text-[#7c869c] cursor-pointer p-1 flex items-center hover:text-[#182449] transition-colors"
                                        >
                                            <i className={showPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'}></i>
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <div className="text-[#e35d6a] text-[12px] mt-1 font-medium">{errors.password}</div>
                                    )}
                                </div>

                                {/* <div className="flex items-center justify-between mt-[-4px] mb-6 text-[13px]">
                                    <label className="flex items-center gap-2 cursor-pointer select-none" htmlFor="remember">
                                        <input
                                            id="remember"
                                            type="checkbox"
                                            name="remember"
                                            tabIndex={3}
                                            className="custom-checkbox"
                                        />
                                        <span>Remember me</span>
                                    </label>
                                    {canResetPassword && (
                                        <Link href={request()} className="text-[#00cca3] font-semibold no-underline hover:underline" tabIndex={5}>
                                            Forgot password?
                                        </Link>
                                    )}
                                </div> */}

                                <button
                                    type="submit"
                                    className="w-full py-3.5 rounded-[10px] bg-[#00cca3] hover:bg-[#009e7e] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white border-none text-[15px] font-semibold transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
                                    tabIndex={4}
                                    disabled={processing}
                                    data-test="login-button"
                                >
                                    {processing && (
                                        <i className="fa-solid fa-spinner fa-spin mr-1.5"></i>
                                    )}
                                    Log in
                                </button>

                                {/* <div className="text-center mt-6 text-[13.5px] text-[#7c869c]">
                                    Don't have an account?{' '}
                                    <Link
                                        href={register({
                                            query: {
                                                invitation: teamInvitation?.code,
                                            },
                                        })}
                                        className="text-[#00cca3] font-semibold no-underline hover:underline"
                                        data-test="register-link"
                                        tabIndex={5}
                                    >
                                        Sign up
                                    </Link>
                                </div> */}
                            </>
                        )}
                    </Form>
                </div>
            </div>
        </>
    );
}
