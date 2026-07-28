import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useRef, useMemo, useEffect, Suspense } from "react";
import {
	TextureLoader,
	Quaternion,
	Vector3,
	Euler,
	SRGBColorSpace,
} from "three";
import type { Mesh, Group } from "three";
import {
	EARTH_TEXTURE_URL,
	EARTH_BUMP_URL,
	EARTH_SPECULAR_URL,
} from "../utils/earthTexture";
import { geoToVector3 } from "../utils/geoToVector3";
import { ICON_MAP } from "../utils/iconMap";
import type { WeatherIcon } from "../interfaces/weather";

interface EarthProps {
	lat?: number;
	lng?: number;
	cityName?: string;
	temp?: string;
	icon?: WeatherIcon;
}

const FRONT_AXIS = new Vector3(0, 0, 1);
const WORLD_Y_AXIS = new Vector3(0, 1, 0);

const ATMOSPHERE_VERTEX = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ATMOSPHERE_FRAGMENT = `
  varying vec3 vNormal;
  uniform vec3 glowColor;
  void main() {
    float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
    gl_FragColor = vec4(glowColor, intensity);
  }
`;

function AtmosphereGlow() {
	return (
		<mesh scale={1.08}>
			<sphereGeometry args={[1.5, 64, 64]} />
			<shaderMaterial
				vertexShader={ATMOSPHERE_VERTEX}
				fragmentShader={ATMOSPHERE_FRAGMENT}
				uniforms={{ glowColor: { value: new Vector3(0.4, 0.7, 1.0) } }}
				transparent
				depthWrite={false}
			/>
		</mesh>
	);
}

interface CityMarkerProps {
	position: Vector3;
	cityName?: string;
	temp?: string;
	icon?: WeatherIcon;
}

function CityMarker({ position, cityName, temp, icon }: CityMarkerProps) {
	const meshRef = useRef<Mesh>(null);
	const Icon = icon ? ICON_MAP[icon] : null;

	useFrame(({ clock }) => {
		if (!meshRef.current) return;
		const pulse = 1 + Math.sin(clock.elapsedTime * 2.5) * 0.25;
		meshRef.current.scale.setScalar(pulse);
	});

	return (
		<group position={position}>
			<mesh ref={meshRef}>
				<sphereGeometry args={[0.035, 16, 16]} />
				<meshBasicMaterial color="#F2A65A" toneMapped={false} />
			</mesh>

			{cityName && temp && (
				<Html
					center
					distanceFactor={4.2}
					className="pointer-events-none select-none"
				>
					<div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-night/85 backdrop-blur-md border border-white/15 shadow-lg whitespace-nowrap -translate-y-8">
						{Icon && (
							<Icon
								size={14}
								strokeWidth={1.5}
								className="text-textPrimary/90"
								aria-hidden="true"
							/>
						)}
						<span className="font-mono text-[10px] text-textPrimary font-medium">
							{temp}
						</span>
					</div>
				</Html>
			)}
		</group>
	);
}

function Earth({ lat, lng, cityName, temp, icon }: EarthProps) {
	const globeRef = useRef<Group>(null);
	const isFocusing = useRef(true);
	const baseQuaternion = useRef(new Quaternion());

	const [colorMap, bumpMap, specularMap] = useLoader(TextureLoader, [
		EARTH_TEXTURE_URL,
		EARTH_BUMP_URL,
		EARTH_SPECULAR_URL,
	]);

	const map = useMemo(() => {
		const clone = colorMap.clone();
		clone.colorSpace = SRGBColorSpace;
		clone.needsUpdate = true;
		return clone;
	}, [colorMap]);
	const hasTarget = lat !== undefined && lng !== undefined;

	const targetPosition = useMemo(
		() => (hasTarget ? geoToVector3(lat!, lng!, 1.5) : null),
		[hasTarget, lat, lng],
	);

	const targetQuaternion = useMemo(() => {
		if (!targetPosition) return null;
		const localDirection = targetPosition.clone().normalize();
		return new Quaternion().setFromUnitVectors(localDirection, FRONT_AXIS);
	}, [targetPosition]);

	useEffect(() => {
		if (hasTarget) isFocusing.current = true;
	}, [lat, lng, hasTarget]);

	useFrame(({ clock }, delta) => {
		const globe = globeRef.current;
		if (!globe) return;

		if (!hasTarget || !targetQuaternion) {
			globe.rotateOnWorldAxis(WORLD_Y_AXIS, delta * 0.12);
			return;
		}

		if (isFocusing.current) {
			globe.quaternion.slerp(targetQuaternion, Math.min(delta * 2.5, 1));

			if (globe.quaternion.angleTo(targetQuaternion) < 0.01) {
				globe.quaternion.copy(targetQuaternion);
				baseQuaternion.current.copy(targetQuaternion);
				isFocusing.current = false;
			}
		} else {
			const t = clock.elapsedTime;
			const tiltX = Math.sin(t * 0.4) * 0.025;
			const tiltZ = Math.cos(t * 0.3) * 0.018;
			const oscillation = new Quaternion().setFromEuler(
				new Euler(tiltX, 0, tiltZ),
			);
			globe.quaternion.copy(baseQuaternion.current).multiply(oscillation);
		}
	});

	return (
		<group ref={globeRef}>
			<mesh>
				<sphereGeometry args={[1.5, 96, 96]} />
				<meshStandardMaterial
					map={map}
					bumpMap={bumpMap}
					bumpScale={0.03}
					roughnessMap={specularMap}
					metalness={0.15}
					roughness={0.8}
				/>
			</mesh>
			<AtmosphereGlow />
			{hasTarget && targetPosition && (
				<CityMarker
					position={targetPosition}
					cityName={cityName}
					temp={temp}
					icon={icon}
				/>
			)}
		</group>
	);
}

function GlobeLoader() {
	return (
		<div
			className="absolute inset-0 flex items-center justify-center"
			role="status"
			aria-live="polite"
		>
			<span className="text-textMuted font-mono text-xs animate-pulse">
				Cargando globo…
			</span>
		</div>
	);
}

interface LocationGlobeProps {
	lat?: number;
	lng?: number;
	cityName?: string;
	temp?: string;
	icon?: WeatherIcon;
}

export function LocationGlobe({
	lat,
	lng,
	cityName,
	temp,
	icon,
}: LocationGlobeProps) {
	return (
		<div className="glass-panel relative w-full h-full min-h-55 overflow-hidden p-3">
			<Suspense fallback={<GlobeLoader />}>
				<Canvas
					camera={{ position: [0, 0, 4], fov: 45 }}
					gl={{ alpha: true, antialias: true }}
					style={{ background: "transparent" }}
					onCreated={({ gl }) => gl.setClearAlpha(0)}
				>
					<ambientLight intensity={0.7} />
					<directionalLight position={[3, 2, 5]} intensity={1.15} />
					<Earth
						lat={lat}
						lng={lng}
						cityName={cityName}
						temp={temp}
						icon={icon}
					/>
				</Canvas>
			</Suspense>
		</div>
	);
}
