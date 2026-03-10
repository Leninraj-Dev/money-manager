import { Button } from "@/components/ui/button";
import { Shield, TrendingUp, Wallet, Zap } from "lucide-react";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginScreen() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[380px] flex flex-col items-center">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 18, stiffness: 200 }}
          className="w-20 h-20 rounded-3xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-6"
        >
          <Wallet className="w-10 h-10 text-primary" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl font-black mb-2 tracking-tight">
            Money Manager
          </h1>
          <p className="text-muted-foreground text-sm">
            Track income and expenses with ease
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="w-full space-y-3 mb-10"
        >
          {[
            {
              icon: TrendingUp,
              label: "Track income & expenses",
              color: "text-income",
            },
            {
              icon: Shield,
              label: "Secure & decentralized",
              color: "text-primary",
            },
            {
              icon: Zap,
              label: "Instant balance overview",
              color: "text-yellow-400",
            },
          ].map(({ icon: Icon, label, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="flex items-center gap-3 bg-card rounded-2xl px-4 py-3"
            >
              <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <span className="text-sm font-medium">{label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Login Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full"
        >
          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="w-full h-14 rounded-2xl text-base font-bold shadow-lg shadow-primary/30"
            data-ocid="login.primary_button"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Connecting...
              </>
            ) : (
              "Get Started"
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-4">
            Powered by Internet Identity · Fully decentralized
          </p>
        </motion.div>
      </div>

      {/* Footer */}
      <p className="absolute bottom-6 text-xs text-muted-foreground/50">
        © {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-muted-foreground transition-colors"
        >
          Built with love using caffeine.ai
        </a>
      </p>
    </div>
  );
}
