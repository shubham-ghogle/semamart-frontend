import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import { AiOutlineLoading } from "react-icons/ai";
import { SecondryBtn } from "../../components/UI/Buttons";

export default function UserActivationScreen() {
  const { token } = useParams();

  const { status } = useQuery({
    queryFn: async () => {
      if (!token) throw new Error();

      const res = await fetch("/api/v2/user/activation", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ activation_token: token }),
      });
      if (!res.ok) throw new Error();
      return await res.json();
    },
    queryKey: ["activation_token"],
    gcTime: 0,
    retry: 0,
  });

  const navigate = useNavigate();

  return (
    <main>
      {status === "error" && (
        <section className="min-h-screen grid place-items-center">
          <article>
            <p className="text-2xl">Token not Valid</p>
            <SecondryBtn onClick={() => navigate("/")}>Back Home</SecondryBtn>
          </article>
        </section>
      )}
      {status === "pending" && (
        <section className="min-h-screen grid place-items-center">
          <p className="text-2xl flex items-center gap-3">
            <span>
              <AiOutlineLoading className="animate-spin" />
            </span>
            Loading
          </p>
        </section>
      )}
      {status === "success" && (
        <section className="min-h-screen grid place-items-center">
          <article className="grid place-items-center">
            <p className="text-2xl">Your account is now verified.</p>
            <SecondryBtn onClick={() => navigate("/login")}>Login</SecondryBtn>
          </article>
        </section>
      )}
    </main>
  );
}
