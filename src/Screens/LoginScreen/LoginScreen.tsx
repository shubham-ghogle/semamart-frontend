import LoginForm from "../../components/Login/LoginForm";

export default function LoginScreen() {
  return (
    <div className="min-h-screen bg-linear-to-b from-custom-blue to-custom-green flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <LoginForm />
    </div>
  );
}
