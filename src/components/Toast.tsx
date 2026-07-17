import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { useEffect } from "react";

interface ToastProps {
	message: string | null;
	onDismiss: () => void;
	duration?: number;
}

export function Toast({ message, onDismiss, duration = 4000 }: ToastProps) {
	useEffect(() => {
		if (!message) return;
		const timer = setTimeout(onDismiss, duration);
		return () => clearTimeout(timer);
	}, [message, duration, onDismiss]);

	return (
		<div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
			<AnimatePresence>
				{message && (
					<motion.div
						initial={{ opacity: 0, y: -20 }}
						animate={{
							opacity: 1,
							y: 0,
							transition: { duration: 0.35, ease: [0.23, 1, 0.32, 1] },
						}}
						exit={{
							opacity: 0,
							y: -20,
							transition: { duration: 0.18, ease: "easeIn" },
						}}
						role="status"
						aria-live="polite"
						className="glass-panel flex items-center gap-2 px-4 py-3 max-w-sm pointer-events-auto"
					>
						<AlertCircle
							size={18}
							className="text-skyDusk shrink-0"
						/>
						<span className="font-body text-sm text-textPrimary">
							{message}
						</span>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
