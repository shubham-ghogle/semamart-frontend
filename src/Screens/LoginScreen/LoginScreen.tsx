import LoginForm from "../../components/Login/LoginForm";

export default function LoginScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-customBlue to-customGreen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <LoginForm />
    </div>
  );
}
