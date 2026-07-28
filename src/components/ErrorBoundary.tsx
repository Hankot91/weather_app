import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface ErrorBoundaryProps {
	children: ReactNode;
	/** Fallback custom; si no se pasa, se usa un panel genérico. */
	fallback?: ReactNode;
	/** Nombre legible de la sección, para el mensaje por defecto y los logs. */
	label?: string;
	/** Se llama cuando el boundary atrapa un error (para logging externo). */
	onError?: (error: Error, info: ErrorInfo) => void;
}

interface ErrorBoundaryState {
	hasError: boolean;
}

/**
 * Boundary genérico de React. Atrapa errores de render/lifecycle en el
 * subárbol que envuelve (por ejemplo, el globo 3D con WebGL) para que un
 * fallo ahí no tumbe toda la pantalla — el resto de la app sigue viva.
 */
export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	state: ErrorBoundaryState = { hasError: false };

	static getDerivedStateFromError(): ErrorBoundaryState {
		return { hasError: true };
	}

	componentDidCatch(error: Error, info: ErrorInfo) {
		this.props.onError?.(error, info);
		// eslint-disable-next-line no-console
		console.error(`[ErrorBoundary${this.props.label ? `: ${this.props.label}` : ""}]`, error, info);
	}

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) return this.props.fallback;

			return (
				<div className="glass-panel flex flex-col items-center justify-center gap-2 w-full h-full min-h-40 p-6 text-center">
					<AlertTriangle size={22} className="text-skyDusk" />
					<p className="font-body text-sm text-textPrimary">
						{this.props.label
							? `No se pudo mostrar ${this.props.label}.`
							: "Ocurrió un problema al mostrar este contenido."}
					</p>
					<p className="font-mono text-[11px] text-textMuted">
						El resto de la app sigue funcionando con normalidad.
					</p>
				</div>
			);
		}

		return this.props.children;
	}
}
