export function getCurrentPosition(): Promise<GeolocationPosition> {
	return new Promise((resolve, reject) => {
		if (!navigator.geolocation) {
			reject(new Error("Tu navegador no soporta geolocalización."));
			return;
		}
		navigator.geolocation.getCurrentPosition(resolve, reject, {
			enableHighAccuracy: false,
			timeout: 8000,
		});
	});
}

export function getGeolocationErrorMessage(error: unknown): string {
	if (error instanceof GeolocationPositionError) {
		switch (error.code) {
			case error.PERMISSION_DENIED:
				return "No pudimos acceder a tu ubicación. Habilitá el permiso en tu navegador e intentá de nuevo.";
			case error.POSITION_UNAVAILABLE:
				return "Tu ubicación no está disponible en este momento.";
			case error.TIMEOUT:
				return "La solicitud de ubicación tardó demasiado. Intentá de nuevo.";
			default:
				return "No pudimos obtener tu ubicación.";
		}
	}
	if (error instanceof Error) return error.message;
	return "No pudimos obtener tu ubicación.";
}
