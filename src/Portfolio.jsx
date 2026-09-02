import React, { useEffect, useRef, useState, useCallback } from "react";
import BookingWidget from "./BookingWidget.jsx";

/* ================= Data ================= */

const CORE = { id: "core", label: "Jerónimo", x: 300, y: 250, r: 30, core: true };
const RADIUS = 172;

const SATELLITES_RAW = [
  { id: "benji", label: "Benji", tag: "Asistente personal on-prem", target: "sistema-benji" },
  { id: "traza", label: "TRAZA", tag: "Plataforma OSINT colaborativa", target: "sistema-traza" },
  { id: "cumbre", label: "Cumbre", tag: "Gestión patrimonial", target: "sistema-cumbre" },
  { id: "erp", label: "ERP minero", tag: "Nómina y operación minera", target: "sistema-erp" },
  { id: "inmo", label: "Inmobiliaria", tag: "Agente de WhatsApp con IA", target: "sistema-inmo" },
  { id: "soc", label: "SOC", tag: "Ciberseguridad y respuesta a incidentes", target: "experiencia" },
  { id: "eafit", label: "EAFIT", tag: "Ingeniería de Sistemas · investigación", target: "formacion" },
];

const SATELLITES = SATELLITES_RAW.map((s, i) => {
  const angle = (-90 + (360 / SATELLITES_RAW.length) * i) * (Math.PI / 180);
  return {
    ...s,
    r: 15,
    x: Math.round(CORE.x + RADIUS * Math.cos(angle)),
    y: Math.round(CORE.y + RADIUS * Math.sin(angle)),
  };
});

const NODES = [CORE, ...SATELLITES];
const EDGES = SATELLITES.map((n) => ({ from: CORE, to: n }));
// relaciones de segundo orden entre sistemas, no solo con el nodo central
const CROSS_EDGES = [
  ["soc", "traza"],
  ["eafit", "soc"],
].map(([a, b]) => ({ from: SATELLITES.find((n) => n.id === a), to: SATELLITES.find((n) => n.id === b) }));

const EXPERIENCE = [
  {
    period: "2024 — presente",
    role: "Project Manager & Solutions Architect · Full Stack",
    context: "Proyectos freelance",
    detail:
      "Arquitectura y despliegue de plataformas SaaS, ERPs, LMS y apps móviles para clientes de educación, logística, investigación, turismo y gestión empresarial, coordinando equipos de ingeniería multidisciplinarios de principio a fin.",
    stack: ["Next.js", "Node.js", "Django", "PostgreSQL", "Terraform", "OAuth 2.0/OIDC"],
  },
  {
    period: "2024 — presente",
    role: "AI Solutions Architect & Business Automation",
    context: "Clientes comerciales",
    detail:
      "Diseño de plataformas de automatización inteligente que integran agentes de IA con WhatsApp, CRMs, pipelines OCR y flujos empresariales — asistentes capaces de automatizar procesos operativos y de atención al cliente.",
    stack: ["Claude API", "OpenAI API", "Python", "n8n", "MCP", "OCR"],
  },
  {
    period: "2025",
    role: "Arquitectura SOC & Ciberseguridad",
    context: "Proyectos empresariales",
    detail:
      "Diseño e implementación de Centros de Operaciones de Seguridad: monitoreo de infraestructura, observabilidad, correlación de eventos, hardening de Linux, respuesta a incidentes y gobierno de seguridad alineado a OWASP, ISO 27001 y NIST.",
    stack: ["Wazuh", "ELK Stack", "Grafana", "SIEM", "IDS/IPS"],
  },
];

const FEATURED = [
  {
    id: "sistema-benji",
    tag: "Asistente personal · on-prem",
    name: "Benji",
    period: "En operación",
    summary:
      "Secretaría de IA sobre infraestructura propia, no en la nube de un tercero. Gestiona correo, agenda y hojas de cálculo, con modelos locales repartidos por tipo de tarea y un motor de permisos que exige confirmación humana antes de cualquier acción irreversible.",
    facts: [
      "319 herramientas registradas en 21 categorías",
      "Modelos locales enrutados por tipo de tarea, sin depender de un proveedor externo",
      "Memoria episódica, semántica y de grafo de conocimiento",
    ],
    stack: ["FastAPI", "MongoDB", "Qdrant", "Ollama", "Docker"],
  },
  {
    id: "sistema-traza",
    tag: "OSINT · colaborativo",
    name: "TRAZA",
    period: "En desarrollo",
    summary:
      "Plataforma de inteligencia de fuentes abiertas construida en colaboración con un equipo de ciberseguridad preventiva, con un reporte técnico ejecutivo preparado para el registro de propiedad intelectual del sistema.",
    facts: ["Reporte técnico ejecutivo en LaTeX para registro de IP", "Módulo en evaluación para fuentes complementarias"],
    stack: ["OSINT", "Backend a medida", "LaTeX"],
  },
  {
    id: "sistema-cumbre",
    tag: "Fintech · gestión patrimonial",
    name: "Cumbre",
    period: "MVP funcional",
    summary:
      "El «sistema operativo del patrimonio»: familias de alto patrimonio y asesores independientes centralizan cuentas, inversiones, inmuebles y pasivos en un solo lugar, con un asesor de IA que solo razona sobre cifras ya calculadas.",
    facts: [
      "Planes por suscripción: Persona, Familia y Asesor multi-cliente",
      "Pensado para Colombia primero, luego México, Brasil y la región Andina",
    ],
    stack: ["React 19", "Express 5", "PostgreSQL", "Drizzle", "Stripe"],
  },
  {
    id: "sistema-erp",
    tag: "ERP · sector minero",
    name: "ERP para minería",
    period: "Propuesta cerrada",
    summary:
      "Sistema de nómina, asistencia y operación para un cliente del sector minero en Colombia. El encargo incluyó una propuesta interactiva con visualizaciones 3D y los diagramas de arquitectura para audiencia técnica.",
    facts: ["Visualizaciones 3D con Three.js en la propuesta interactiva", "Anexo técnico con control de cambios de alcance"],
    stack: ["FastAPI", "Next.js", "PostgreSQL", "Three.js"],
  },
  {
    id: "sistema-inmo",
    tag: "PropTech · agente conversacional",
    name: "Plataforma inmobiliaria",
    period: "Entregado",
    summary:
      "Plataforma digital con un agente de WhatsApp que atiende consultas usando IA, orquestado junto con la propuesta comercial y la guía técnica del proyecto.",
    facts: ["Agente de WhatsApp orquestado con n8n"],
    stack: ["Next.js", "Claude API", "n8n"],
  },
];

const CLIENT_WORK = [
  { name: "SaaS para agencia de viajes", detail: "Diagnóstico de plataforma existente y propuesta de arquitectura SaaS con guía técnica completa." },
  { name: "Marketplace de cursos (LMS)", detail: "Project manager de un equipo de 4 personas durante 3 semanas. Next.js + microservicios en FastAPI sobre AWS." },
  { name: "Agente de monitoreo de vuelos", detail: "Alertas automáticas para rutas específicas desde Medellín, con LangChain y un motor de búsqueda en tiempo real." },
  { name: "Pipeline de analítica de ventas", detail: "Reportes automatizados por chat para clientes recurrentes. Python desplegado en Railway." },
];

const SKILLS = [
  { group: "Arquitectura de software", items: ["Arquitectura empresarial", "Microservicios", "SaaS", "REST APIs", "OAuth 2.0/OIDC", "RBAC", "IaC"] },
  { group: "Cloud & DevOps", items: ["AWS", "Google Cloud", "Docker", "Terraform", "Cloudflare", "Vercel", "CI/CD"] },
  { group: "Ciberseguridad", items: ["SIEM", "Wazuh", "EDR/XDR", "IDS/IPS", "Pentesting", "OSINT", "Forense digital", "Hardening Linux"] },
  { group: "Inteligencia artificial", items: ["Claude Code", "Cursor", "MCP", "Agentes de IA", "OCR", "Prompt engineering"] },
  { group: "Programación", items: ["Python", "TypeScript", "JavaScript", "Django", "Next.js", "React", "C/C++", "SQL"] },
];

const LAB = [
  "Solucionador de ruteo de vehículos (VRP), con informe en LaTeX",
  "Simulación Monte Carlo de inventario de banco de sangre",
  "Kernel de sistema operativo xv6 en C",
  "Backend de e-commerce con Clean Architecture y modelos generativos",
  "Regresión de edad con redes convolucionales (CNN)",
  "Investigación en contenerización de HPC y computación distribuida",
];

const CERTS = ["ISC2 Certified in Cybersecurity (CC)", "ISO/IEC 27001:2022 Auditor Implementer", "Especialización en Ciberseguridad (en curso)"];

const BOOT_LINES = [
  "iniciando entorno...",
  "montando arquitectura de sistemas...",
  "sincronizando Benji · Cumbre · TRAZA...",
  "verificando integridad — ok",
  "listo.",
];

/* ================= Hooks ================= */

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    const fn = () => setReduced(m.matches);
    m.addEventListener?.("change", fn);
    return () => m.removeEventListener?.("change", fn);
  }, []);
  return reduced;
}

function useReveal(reducedMotion) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(reducedMotion);
  useEffect(() => {
    if (reducedMotion) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [reducedMotion]);
  return [ref, visible];
}

/* ================= Small pieces ================= */

function Reveal({ children, reducedMotion, className = "" }) {
  const [ref, visible] = useReveal(reducedMotion);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(18px)",
        transition: "opacity 700ms ease, transform 700ms ease",
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ n, children }) {
  return (
    <div className="flex items-baseline gap-3 mb-8">
      <span className="text-sm shrink-0" style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}>
        §{n}
      </span>
      <h2 className="text-2xl sm:text-3xl" style={{ fontFamily: "var(--font-display)", color: "var(--paper)" }}>
        {children}
      </h2>
    </div>
  );
}

function Tag({ children, onClick, active }) {
  const interactive = typeof onClick === "function";
  const Comp = interactive ? "button" : "span";
  return (
    <Comp
      onClick={onClick}
      className="inline-block px-2 py-0.5 text-xs border rounded-sm transition-colors"
      style={{
        fontFamily: "var(--font-mono)",
        color: active ? "var(--ink)" : "var(--steel-light)",
        background: active ? "var(--accent)" : "transparent",
        borderColor: active ? "var(--accent)" : "var(--line)",
        cursor: interactive ? "pointer" : "default",
      }}
    >
      {children}
    </Comp>
  );
}

/* ================= Boot screen ================= */

function BootScreen({ onDone, reducedMotion }) {
  const [lineIdx, setLineIdx] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      onDone();
      return;
    }
    if (lineIdx < BOOT_LINES.length) {
      const t = setTimeout(() => setLineIdx((i) => i + 1), lineIdx === 0 ? 260 : 340);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setLeaving(true), 380);
    const t2 = setTimeout(onDone, 900);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, [lineIdx, onDone, reducedMotion]);

  if (reducedMotion) return null;

  const progress = Math.min(100, Math.round((lineIdx / BOOT_LINES.length) * 100));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{
        background: "var(--ink)",
        opacity: leaving ? 0 : 1,
        transition: "opacity 480ms ease",
        pointerEvents: leaving ? "none" : "auto",
      }}
    >
      <div className="w-full max-w-sm" style={{ fontFamily: "var(--font-mono)" }}>
        <div className="space-y-1.5 mb-6 h-32">
          {BOOT_LINES.slice(0, lineIdx).map((l, i) => (
            <p key={i} className="text-xs" style={{ color: i === lineIdx - 1 ? "var(--accent-light)" : "var(--steel-light)" }}>
              <span style={{ color: "var(--steel)" }}>&gt;</span> {l}
            </p>
          ))}
        </div>
        <div className="h-[2px] w-full" style={{ background: "var(--line)" }}>
          <div style={{ width: `${progress}%`, height: "100%", background: "var(--accent)", transition: "width 260ms ease" }} />
        </div>
        <p className="text-[11px] mt-2" style={{ color: "var(--steel)" }}>
          {progress}%
        </p>
      </div>
    </div>
  );
}

/* ================= Hero diagram ================= */

function HeroDiagram({ reducedMotion }) {
  const [drawn, setDrawn] = useState(reducedMotion);
  const [hovered, setHovered] = useState(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  useEffect(() => {
    if (reducedMotion) return;
    const t = setTimeout(() => setDrawn(true), 120);
    return () => clearTimeout(t);
  }, [reducedMotion]);

  const handleMove = useCallback(
    (e) => {
      if (reducedMotion || !svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      setTilt({ x: px * 8, y: py * 8 });
    },
    [reducedMotion]
  );

  const goTo = (target) => {
    document.getElementById(target)?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  };

  const hoveredNode = SATELLITES.find((n) => n.id === hovered);
  const corner = (x, y, fx, fy) => `M ${x} ${y + fy * 16} L ${x} ${y} L ${x + fx * 16} ${y}`;

  return (
    <div>
      <svg
        ref={svgRef}
        viewBox="0 0 600 500"
        className="w-full h-auto max-w-xl mx-auto lg:mx-0"
        role="img"
        aria-label="Diagrama interactivo de los sistemas que conecta Jerónimo"
        onMouseMove={handleMove}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      >
        <defs>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="var(--line)" strokeWidth="0.5" />
          </pattern>
          <filter id="nodeGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {EDGES.map((e) => (
            <path key={`path-${e.to.id}`} id={`edge-${e.to.id}`} d={`M ${e.from.x} ${e.from.y} L ${e.to.x} ${e.to.y}`} fill="none" />
          ))}
        </defs>

        <rect width="600" height="500" fill="url(#grid)" opacity="0.4" />

        {/* corner instrument brackets */}
        {[
          corner(14, 14, 1, 1),
          corner(586, 14, -1, 1),
          corner(14, 486, 1, -1),
          corner(586, 486, -1, -1),
        ].map((d, i) => (
          <path key={i} d={d} stroke="var(--steel)" strokeWidth="1.5" fill="none" opacity="0.7" />
        ))}

        <g style={{ transform: `translate(${tilt.x}px, ${tilt.y}px)`, transition: "transform 200ms ease-out" }}>
          {/* radar rings */}
          {[0.34, 0.67, 1].map((f) => (
            <circle key={f} cx={CORE.x} cy={CORE.y} r={RADIUS * f} fill="none" stroke="var(--line)" strokeWidth="1" opacity="0.6" />
          ))}

          {/* secondary system-to-system relations */}
          {CROSS_EDGES.map((e, i) => (
            <line
              key={`cross-${i}`}
              x1={e.from.x}
              y1={e.from.y}
              x2={e.to.x}
              y2={e.to.y}
              stroke="var(--steel)"
              strokeWidth="1"
              strokeDasharray="3 4"
              opacity={drawn ? 0.55 : 0}
              style={{ transition: `opacity 600ms ease ${600 + i * 120}ms` }}
            />
          ))}

          {/* primary spokes */}
          {EDGES.map((e, i) => {
            const active = hovered === e.to.id;
            return (
              <line
                key={e.to.id}
                x1={e.from.x}
                y1={e.from.y}
                x2={e.to.x}
                y2={e.to.y}
                stroke={active ? "var(--accent)" : "var(--steel)"}
                strokeWidth={active ? 2 : 1}
                style={{
                  strokeDasharray: 400,
                  strokeDashoffset: drawn ? 0 : 400,
                  transition: `stroke-dashoffset 900ms ease ${i * 90}ms, stroke 200ms ease, stroke-width 200ms ease`,
                }}
              />
            );
          })}

          {/* traveling signal pulses along each spoke */}
          {!reducedMotion &&
            drawn &&
            EDGES.map((e, i) => (
              <circle key={`pulse-${e.to.id}`} r="2.5" fill="var(--accent-light)" opacity="0.9">
                <animateMotion dur="3.6s" begin={`${i * 0.5}s`} repeatCount="indefinite">
                  <mpath href={`#edge-${e.to.id}`} />
                </animateMotion>
              </circle>
            ))}

          {NODES.map((n, i) => (
            <g
              key={n.id}
              tabIndex={n.core ? -1 : 0}
              role={n.core ? undefined : "button"}
              aria-label={n.core ? undefined : `Ir a ${n.label} — ${n.tag}`}
              onMouseEnter={() => !n.core && setHovered(n.id)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => !n.core && setHovered(n.id)}
              onBlur={() => setHovered(null)}
              onClick={() => !n.core && goTo(n.target)}
              onKeyDown={(e) => {
                if (!n.core && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  goTo(n.target);
                }
              }}
              style={{
                cursor: n.core ? "default" : "pointer",
                outline: "none",
                opacity: drawn ? 1 : 0,
                transform: drawn ? "scale(1)" : "scale(0.6)",
                transformOrigin: `${n.x}px ${n.y}px`,
                transition: `opacity 500ms ease ${150 + i * 90}ms, transform 500ms ease ${150 + i * 90}ms`,
              }}
            >
              <circle
                cx={n.x}
                cy={n.y}
                r={hovered === n.id ? n.r + 3 : n.r}
                fill={n.core ? "var(--accent)" : "var(--ink-raised)"}
                stroke={n.core ? "var(--accent)" : hovered === n.id ? "var(--accent)" : "var(--steel-light)"}
                strokeWidth={n.core ? 0 : 1.5}
                filter={n.core || hovered === n.id ? "url(#nodeGlow)" : undefined}
                style={{ transition: "r 200ms ease, stroke 200ms ease" }}
              />
              <text
                x={n.x}
                y={n.core ? n.y + 5 : n.y + n.r + 16}
                textAnchor="middle"
                fill={n.core ? "var(--ink)" : hovered === n.id ? "var(--accent-light)" : "var(--paper)"}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: n.core ? 13 : 11,
                  fontWeight: n.core ? 700 : 400,
                  transition: "fill 200ms ease",
                }}
              >
                {n.label}
              </text>
            </g>
          ))}
        </g>
      </svg>

      <div
        className="flex items-center gap-2 mt-3 text-xs h-5"
        style={{ fontFamily: "var(--font-mono)", color: hoveredNode ? "var(--accent-light)" : "var(--steel-light)" }}
      >
        <span style={{ color: "var(--accent)" }}>»</span>
        <span>{hoveredNode ? `${hoveredNode.label} — ${hoveredNode.tag}` : "pasa el cursor sobre un nodo, o haz clic para ir al sistema"}</span>
      </div>
    </div>
  );
}

function FeaturedBlock({ project, index, reducedMotion, activeFilter, onFilterClick }) {
  const reversed = index % 2 === 1;
  const dimmed = activeFilter && !project.stack.includes(activeFilter);
  return (
    <Reveal reducedMotion={reducedMotion}>
      <div
        id={project.id}
        className={`grid lg:grid-cols-12 gap-6 lg:gap-10 py-10 px-3 -mx-3 items-start rounded-sm transition-all hover:bg-white/[0.02] scroll-mt-20 ${index !== 0 ? "border-t" : ""}`}
        style={{ borderColor: "var(--line)", opacity: dimmed ? 0.35 : 1, filter: dimmed ? "grayscale(0.4)" : "none" }}
      >
        <div className={`lg:col-span-4 ${reversed ? "lg:order-2 lg:text-right" : ""}`}>
          <p className="text-xs mb-2" style={{ fontFamily: "var(--font-mono)", color: "var(--accent-light)" }}>
            {project.tag}
          </p>
          <h3 className="text-2xl mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--paper)" }}>
            {project.name}
          </h3>
          <p className="text-sm" style={{ color: "var(--steel-light)" }}>
            {project.period}
          </p>
          <div className={`flex flex-wrap gap-1.5 mt-4 ${reversed ? "lg:justify-end" : ""}`}>
            {project.stack.map((s) => (
              <Tag key={s} active={activeFilter === s} onClick={() => onFilterClick(s)}>
                {s}
              </Tag>
            ))}
          </div>
        </div>
        <div className={`lg:col-span-8 ${reversed ? "lg:order-1" : ""}`}>
          <p className="text-base leading-relaxed mb-4 max-w-[62ch]" style={{ fontFamily: "var(--font-body)", color: "var(--paper-dim)" }}>
            {project.summary}
          </p>
          <ul className="space-y-1.5">
            {project.facts.map((f) => (
              <li key={f} className="text-sm flex gap-2" style={{ color: "var(--steel-light)" }}>
                <span style={{ color: "var(--accent)" }}>—</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Reveal>
  );
}

/* ================= Main ================= */

export default function Portfolio() {
  const reducedMotion = usePrefersReducedMotion();
  const [booting, setBooting] = useState(true);
  const [scrollPct, setScrollPct] = useState(0);
  const fontsLoaded = useRef(false);

  useEffect(() => {
    if (fontsLoaded.current) return;
    fontsLoaded.current = true;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=JetBrains+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const pct = h.scrollHeight > h.clientHeight ? h.scrollTop / (h.scrollHeight - h.clientHeight) : 0;
      setScrollPct(pct);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [activeSection, setActiveSection] = useState("");
  useEffect(() => {
    const ids = ["experiencia", "sistemas", "stack", "reservas", "contacto"];
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [booting]);

  const handleBootDone = useCallback(() => setBooting(false), []);

  const [activeFilter, setActiveFilter] = useState(null);
  const handleFilterClick = useCallback(
    (value) => {
      setActiveFilter((prev) => (prev === value ? null : value));
      document.getElementById("sistemas")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    },
    [reducedMotion]
  );

  const [copied, setCopied] = useState(null);
  const copyText = useCallback(async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1800);
    } catch {
      /* clipboard unavailable — ignore silently */
    }
  }, []);

  const spotRef = useRef(null);
  useEffect(() => {
    if (reducedMotion) return;
    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      if (spotRef.current) {
        spotRef.current.style.background = `radial-gradient(480px circle at ${x}% ${y}%, rgba(201,151,63,0.07), transparent 60%)`;
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [reducedMotion]);

  return (
    <div
      style={{
        "--ink": "#12181F",
        "--ink-raised": "#171F28",
        "--paper": "#EFEAE0",
        "--paper-dim": "#CFC9BC",
        "--line": "#2B3644",
        "--steel": "#3A4C5E",
        "--steel-light": "#8A95A3",
        "--accent": "#C9973F",
        "--accent-light": "#E0B767",
        "--font-display": "'Space Grotesk', 'Avenir Next', sans-serif",
        "--font-body": "'Source Serif 4', Georgia, serif",
        "--font-mono": "'JetBrains Mono', 'SF Mono', Menlo, monospace",
        background: "var(--ink)",
        fontFamily: "var(--font-body)",
      }}
      className="min-h-screen relative"
    >
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, var(--line) 0px, transparent 1px, transparent 64px), repeating-linear-gradient(90deg, var(--line) 0px, transparent 1px, transparent 64px)",
          opacity: 0.12,
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(201,151,63,0.10), transparent)" }}
      />
      <div ref={spotRef} className="fixed inset-0 pointer-events-none" />
      {booting && <BootScreen onDone={handleBootDone} reducedMotion={reducedMotion} />}

      {/* scroll progress rail */}
      <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-[2px] z-20" style={{ background: "var(--line)" }}>
        <div style={{ height: `${scrollPct * 100}%`, width: "100%", background: "var(--accent)", transition: "height 80ms linear" }} />
      </div>

      <div
        style={{
          opacity: booting ? 0 : 1,
          transition: "opacity 600ms ease 100ms",
        }}
      >
        {/* nav */}
        <header className="sticky top-0 z-10 backdrop-blur border-b" style={{ borderColor: "var(--line)", background: "rgba(18,24,31,0.85)" }}>
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--paper)" }} className="text-sm">
              J. Restrepo Ángel
            </span>
            <nav className="hidden sm:flex gap-6 text-sm" style={{ fontFamily: "var(--font-mono)", color: "var(--steel-light)" }}>
              {["experiencia", "sistemas", "stack", "reservas", "contacto"].map((id) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="relative pb-1"
                  style={{ color: activeSection === id ? "var(--accent-light)" : "inherit" }}
                >
                  {id}
                  <span
                    className="absolute left-0 right-0 -bottom-0.5 h-px"
                    style={{
                      background: "var(--accent)",
                      transform: activeSection === id ? "scaleX(1)" : "scaleX(0)",
                      transformOrigin: "left",
                      transition: "transform 250ms ease",
                    }}
                  />
                </a>
              ))}
            </nav>
          </div>
        </header>

        {/* hero */}
        <section className="max-w-5xl mx-auto px-6 pt-14 pb-6 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-sm mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-mono)", color: "var(--accent-light)" }}>
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--accent)", animation: reducedMotion ? "none" : "pulse 2.2s ease-in-out infinite" }}
              />
              Medellín, Colombia
            </p>
            <h1 className="text-4xl sm:text-5xl leading-[1.08] mb-6" style={{ fontFamily: "var(--font-display)", color: "var(--paper)" }}>
              Construyo los sistemas que sostienen decisiones reales.
            </h1>
            <p className="text-lg leading-relaxed max-w-[52ch] mb-6" style={{ color: "var(--paper-dim)" }}>
              Ingeniero de Sistemas, arquitecto de soluciones y consultor de IA y ciberseguridad.
              Llevo productos de la arquitectura al despliegue: plataformas SaaS, ERPs, agentes de
              IA y centros de operaciones de seguridad.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://github.com/Jeronimo0228"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 text-sm border rounded-sm"
                style={{ fontFamily: "var(--font-mono)", color: "var(--ink)", background: "var(--accent)", borderColor: "var(--accent)" }}
              >
                github.com/Jeronimo0228
              </a>
              <a
                href="#reservas"
                className="px-4 py-2 text-sm border rounded-sm"
                style={{ fontFamily: "var(--font-mono)", color: "var(--paper)", borderColor: "var(--line)" }}
              >
                reservar sesión
              </a>
              <a
                href="#contacto"
                className="px-4 py-2 text-sm border rounded-sm"
                style={{ fontFamily: "var(--font-mono)", color: "var(--paper)", borderColor: "var(--line)" }}
              >
                trabajemos juntos
              </a>
            </div>
            <div
              className="flex flex-wrap gap-x-5 gap-y-1 mt-8 pt-4 border-t text-xs"
              style={{ borderColor: "var(--line)", fontFamily: "var(--font-mono)", color: "var(--steel-light)" }}
            >
              <span>sistemas activos: 05</span>
              <span>certificaciones: 03</span>
              <span>idiomas: ES / EN</span>
            </div>
          </div>
          <HeroDiagram reducedMotion={reducedMotion} />
        </section>

        {/* about strip */}
        <section id="formacion" className="max-w-5xl mx-auto px-6 py-10 border-t scroll-mt-20" style={{ borderColor: "var(--line)" }}>
          <div className="grid sm:grid-cols-3 gap-6 text-sm">
            <div>
              <p style={{ fontFamily: "var(--font-mono)", color: "var(--accent-light)" }}>formación</p>
              <p style={{ color: "var(--paper-dim)" }} className="mt-1">B.Sc. Ingeniería de Sistemas, Universidad EAFIT · 2023–2026</p>
            </div>
            <div>
              <p style={{ fontFamily: "var(--font-mono)", color: "var(--accent-light)" }}>investigación</p>
              <p style={{ color: "var(--paper-dim)" }} className="mt-1">Grupos de Ciberseguridad y Computación de Alto Rendimiento (HPC)</p>
            </div>
            <div>
              <p style={{ fontFamily: "var(--font-mono)", color: "var(--accent-light)" }}>práctica</p>
              <p style={{ color: "var(--paper-dim)" }} className="mt-1">Punto D' Partida — Creer · Crear · Crecer</p>
            </div>
          </div>
        </section>

        {/* experience */}
        <section id="experiencia" className="border-t scroll-mt-20" style={{ borderColor: "var(--line)", background: "var(--ink-raised)" }}>
          <div className="max-w-5xl mx-auto px-6 py-16">
            <SectionLabel n="1">Experiencia</SectionLabel>
            <div className="space-y-2">
              {EXPERIENCE.map((e) => (
                <Reveal reducedMotion={reducedMotion} key={e.role}>
                  <div className="grid sm:grid-cols-12 gap-4 sm:gap-8 py-6 px-3 -mx-3 rounded-sm transition-colors hover:bg-white/[0.03]">
                    <div className="sm:col-span-3">
                      <p className="text-sm" style={{ fontFamily: "var(--font-mono)", color: "var(--accent-light)" }}>{e.period}</p>
                      <p className="text-xs mt-1" style={{ color: "var(--steel-light)" }}>{e.context}</p>
                    </div>
                    <div className="sm:col-span-9">
                      <h3 className="text-lg mb-2" style={{ fontFamily: "var(--font-display)", color: "var(--paper)" }}>{e.role}</h3>
                      <p className="text-base leading-relaxed mb-3 max-w-[62ch]" style={{ color: "var(--paper-dim)" }}>{e.detail}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {e.stack.map((s) => <Tag key={s}>{s}</Tag>)}
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* certifications */}
        <section className="max-w-5xl mx-auto px-6 py-10 border-t" style={{ borderColor: "var(--line)" }}>
          <p className="text-xs mb-4" style={{ fontFamily: "var(--font-mono)", color: "var(--accent-light)" }}>certificaciones</p>
          <div className="grid sm:grid-cols-3 gap-px" style={{ background: "var(--line)" }}>
            {CERTS.map((c) => (
              <div key={c} className="flex items-start gap-2 px-4 py-3" style={{ background: "var(--ink)" }}>
                <span className="mt-1 shrink-0" style={{ color: "var(--accent)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
                  ✓
                </span>
                <span className="text-sm" style={{ color: "var(--paper-dim)" }}>{c}</span>
              </div>
            ))}
          </div>
        </section>

        {/* featured systems */}
        <section id="sistemas" className="max-w-5xl mx-auto px-6 py-16 border-t scroll-mt-20" style={{ borderColor: "var(--line)" }}>
          <div className="flex flex-wrap items-baseline justify-between gap-3 mb-8">
            <SectionLabel n="2">Sistemas destacados</SectionLabel>
            {activeFilter && (
              <button
                onClick={() => setActiveFilter(null)}
                className="text-xs px-2 py-1 border rounded-sm"
                style={{ fontFamily: "var(--font-mono)", color: "var(--accent-light)", borderColor: "var(--accent)" }}
              >
                filtrando por: {activeFilter} ✕
              </button>
            )}
          </div>
          <div>
            {FEATURED.map((p, i) => (
              <FeaturedBlock
                project={p}
                index={i}
                key={p.name}
                reducedMotion={reducedMotion}
                activeFilter={activeFilter}
                onFilterClick={handleFilterClick}
              />
            ))}
          </div>
        </section>

        {/* client work */}
        <section className="border-t" style={{ borderColor: "var(--line)", background: "var(--ink-raised)" }}>
          <div className="max-w-5xl mx-auto px-6 py-16">
            <SectionLabel n="3">Proyectos colaborativos</SectionLabel>
            <Reveal reducedMotion={reducedMotion}>
              <div className="border rounded-sm overflow-hidden" style={{ borderColor: "var(--line)" }}>
                {CLIENT_WORK.map((c, i) => (
                  <div
                    key={c.name}
                    className={`grid sm:grid-cols-12 gap-2 sm:gap-6 px-5 py-4 transition-colors hover:bg-white/[0.03] ${i !== 0 ? "border-t" : ""}`}
                    style={{ borderColor: "var(--line)" }}
                  >
                    <p className="sm:col-span-4 text-sm" style={{ fontFamily: "var(--font-display)", color: "var(--paper)" }}>{c.name}</p>
                    <p className="sm:col-span-8 text-sm" style={{ color: "var(--steel-light)" }}>{c.detail}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* stack */}
        <section id="stack" className="max-w-5xl mx-auto px-6 py-16 border-t scroll-mt-20" style={{ borderColor: "var(--line)" }}>
          <SectionLabel n="4">Caja de herramientas</SectionLabel>
          <p className="text-xs mb-6" style={{ fontFamily: "var(--font-mono)", color: "var(--steel-light)" }}>
            clic en una tecnología para ver en qué sistemas la uso
          </p>
          <Reveal reducedMotion={reducedMotion}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8">
              {SKILLS.map((s) => (
                <div key={s.group}>
                  <p className="text-xs mb-3" style={{ fontFamily: "var(--font-mono)", color: "var(--accent-light)" }}>{s.group}</p>
                  <div className="flex flex-col gap-1.5 items-start">
                    {s.items.map((it) => (
                      <Tag key={it} active={activeFilter === it} onClick={() => handleFilterClick(it)}>
                        {it}
                      </Tag>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* lab */}
        <section className="border-t" style={{ borderColor: "var(--line)", background: "var(--ink-raised)" }}>
          <div className="max-w-5xl mx-auto px-6 py-16">
            <SectionLabel n="5">Laboratorio académico</SectionLabel>
            <Reveal reducedMotion={reducedMotion}>
              <div className="grid md:grid-cols-2 gap-x-10 gap-y-2">
                {LAB.map((l) => (
                  <p key={l} className="text-sm flex gap-2 py-1.5 border-b" style={{ color: "var(--paper-dim)", borderColor: "var(--line)" }}>
                    <span style={{ color: "var(--accent)" }}>—</span>
                    {l}
                  </p>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* booking */}
        <section id="reservas" className="border-t scroll-mt-20" style={{ borderColor: "var(--line)", background: "var(--ink-raised)" }}>
          <div className="max-w-5xl mx-auto px-6 py-16">
            <SectionLabel n="6">Reservas</SectionLabel>
            <Reveal reducedMotion={reducedMotion}>
              <div className="mb-8 max-w-[62ch]">
                <p className="text-base leading-relaxed mb-2" style={{ color: "var(--paper-dim)" }}>
                  Agenda una sesión de diagnóstico, arquitectura o consultoría. Elige fecha y horario en el calendario.
                </p>
                <p className="text-xs" style={{ fontFamily: "var(--font-mono)", color: "var(--steel-light)" }}>
                  powered by SimplyBook · personaljeronimo.simplybook.me
                </p>
              </div>
              <div className="border rounded-sm overflow-hidden" style={{ borderColor: "var(--line)" }}>
                <BookingWidget />
              </div>
            </Reveal>
          </div>
        </section>

        {/* contact */}
        <section id="contacto" className="max-w-5xl mx-auto px-6 py-20 border-t" style={{ borderColor: "var(--line)" }}>
          <Reveal reducedMotion={reducedMotion}>
            <div className="max-w-xl">
              <h2 className="text-3xl mb-4" style={{ fontFamily: "var(--font-display)", color: "var(--paper)" }}>
                ¿Tienes un sistema por construir?
              </h2>
              <p className="text-base leading-relaxed mb-8" style={{ color: "var(--paper-dim)" }}>
                Desde Punto D' Partida trabajo en desarrollo de software, arquitectura de soluciones
                e IA aplicada para clientes en Colombia y la región. Creer, crear, crecer — esa es la idea.
              </p>
              <div className="flex flex-wrap gap-3 mb-6">
                <a
                  href="#reservas"
                  className="px-5 py-3 text-sm border rounded-sm"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--ink)", background: "var(--accent)", borderColor: "var(--accent)" }}
                >
                  reservar sesión
                </a>
                <a
                  href="mailto:jeronimorestrepo48@gmail.com"
                  onClick={() => copyText("jeronimorestrepo48@gmail.com", "email")}
                  className="px-5 py-3 text-sm border rounded-sm inline-flex items-center gap-2"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--paper)", borderColor: "var(--line)" }}
                >
                  jeronimorestrepo48@gmail.com
                  <span style={{ fontSize: 11, opacity: 0.75 }}>{copied === "email" ? "✓ copiado" : ""}</span>
                </a>
                <a
                  href="https://linkedin.com/in/jerónimo-restrepo-b6615a332"
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3 text-sm border rounded-sm"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--paper)", borderColor: "var(--line)" }}
                >
                  linkedin
                </a>
              </div>
              <button
                onClick={() => copyText("+57 302 3450975", "phone")}
                className="text-sm inline-flex items-center gap-2"
                style={{ fontFamily: "var(--font-mono)", color: "var(--steel-light)" }}
              >
                +57 302 3450975 · Medellín, Colombia
                <span style={{ color: copied === "phone" ? "var(--accent-light)" : "var(--steel)", fontSize: 11 }}>
                  {copied === "phone" ? "✓ copiado" : "(copiar)"}
                </span>
              </button>
            </div>
          </Reveal>
        </section>

        <footer className="border-t" style={{ borderColor: "var(--line)" }}>
          <div className="max-w-5xl mx-auto px-6 py-8 flex flex-wrap justify-between gap-2 text-xs" style={{ fontFamily: "var(--font-mono)", color: "var(--steel)" }}>
            <span>Punto D' Partida — Creer · Crear · Crecer</span>
            <span>Medellín, Colombia</span>
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
      `}</style>
    </div>
  );
}
