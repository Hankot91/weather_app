interface FooterProps {
	lastUpdated: Date | null;
}

export function Footer({ lastUpdated }: FooterProps) {
	return (
		<footer className="relative z-10 flex flex-col items-center gap-1 px-6 py-6 text-center">
			<p className="font-mono text-[11px] text-textMuted/70">
				Datos meteorológicos por{" "}
				<a
					href="https://www.visualcrossing.com/"
					target="_blank"
					rel="noopener noreferrer"
					className="underline underline-offset-2 hover:text-textMuted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyDay/70 rounded"
				>
					Visual Crossing
				</a>
			</p>

			{lastUpdated && (
				<p className="font-mono text-[11px] text-textMuted/70">
					Última actualización:{" "}
					{lastUpdated.toLocaleTimeString("es-ES", {
						hour: "2-digit",
						minute: "2-digit",
					})}
				</p>
			)}
		</footer>
	);
}
