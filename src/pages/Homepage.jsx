import React, { useState, useRef, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Environment,
  MeshTransmissionMaterial,
  PerspectiveCamera,
  Float,
  Text,
  useCursor
} from '@react-three/drei';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronRight, Play, User, LogOut, ChevronDown, LayoutDashboard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/userSlice';
import { useAvatar } from '../hooks/useAvatar';
import useClickOutside from '../hooks/useClickOutside';
import { getRoleLandingRoute } from '../constants/roleRoutes';
import * as THREE from 'three';

// --- 0. Global Styles & Assets ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');
    
    :root {
      --bg-paper: #F9F8F6;
      --obsidian: #0B1221;
      --gold: #C6A87C;
      --gray-line: #E5E5E5;
    }

    body {
      background-color: var(--bg-paper);
      color: var(--obsidian);
      font-family: 'Inter', sans-serif;
      overflow-x: hidden;
    }

    .font-serif { font-family: 'Playfair Display', serif; }
    .font-sans { font-family: 'Inter', sans-serif; }
    
    .noise-bg {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: -1;
      opacity: 0.4;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.1'/%3E%3C/svg%3E");
    }

    .swiss-grid-lines {
      position: absolute;
      inset: 0;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      pointer-events: none;
      max-width: 1400px;
      margin: 0 auto;
      border-left: 1px solid var(--gray-line);
      border-right: 1px solid var(--gray-line);
    }
    
    .swiss-line {
      border-right: 1px solid var(--gray-line);
      height: 100%;
    }

    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `}</style>
);

// --- 1. 3D Components ---

// The Prism (Hero)
const GlassPrism = () => {
  const mesh = useRef(null);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
      mesh.current.rotation.y += 0.005;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={mesh} scale={1.5}>
        <icosahedronGeometry args={[1, 0]} />
        <MeshTransmissionMaterial
          backside
          samples={16}
          resolution={512}
          transmission={1}
          roughness={0.0}
          thickness={3.5}
          ior={1.5}
          chromaticAberration={1}
          anisotropy={20}
          distortion={0.5}
          distortionScale={0.5}
          temporalDistortion={0.1}
          clearcoat={1}
          attenuationDistance={0.5}
          attenuationColor="#ffffff"
          color="#ffffff"
          bg="#F9F8F6"
        />
      </mesh>
    </Float>
  );
};

// The Wireframe Mesh (AI)
const TopoMesh = () => {
  const mesh = useRef(null);

  useFrame((state) => {
    if (mesh.current) {
      const time = state.clock.elapsedTime;
      const positions = mesh.current.geometry.attributes.position;

      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        // Create undulating wave effect
        const z = Math.sin(x * 0.5 + time) * Math.cos(y * 0.5 + time) * 0.5;
        positions.setZ(i, z);
      }
      positions.needsUpdate = true;
      mesh.current.rotation.z = time * 0.05;
    }
  });

  return (
    <mesh ref={mesh} rotation={[-Math.PI / 3, 0, 0]}>
      <planeGeometry args={[8, 8, 32, 32]} />
      <meshBasicMaterial
        color="#0B1221"
        wireframe
        transparent
        opacity={0.3}
      />
    </mesh>
  );
};

// The Trust Shield Particles
const ParticleShield = () => {
  const count = 200;
  const [positions] = useState(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = 1.5 + Math.random() * 0.2; // Ring radius
      pos[i * 3] = r * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(theta);
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
    }
    return pos;
  });

  const points = useRef(null);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.z += 0.002;
      points.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#C6A87C"
        transparent
        opacity={0.8}
        sizeAttenuation={true}
      />
    </points>
  );
};

// --- 2. UI Components ---

const Section = ({ children, className = "" }) => (
  <section className={`relative max-w-[1400px] mx-auto px-6 md:px-12 ${className}`}>
    {/* Vertical Grid Lines for this section */}
    <div className="absolute inset-0 pointer-events-none flex justify-between px-6 md:px-12 z-0">
      <div className="w-px h-full bg-[#E5E5E5]" />
      <div className="w-px h-full bg-[#E5E5E5] hidden md:block" />
      <div className="w-px h-full bg-[#E5E5E5] hidden md:block" />
      <div className="w-px h-full bg-[#E5E5E5]" />
    </div>
    <div className="relative z-10 h-full">
      {children}
    </div>
  </section>
);

const WorkspaceCard = ({ title, role, image }) => {
  return (
    <motion.div
      className="relative w-[300px] h-[500px] flex-shrink-0 overflow-hidden group cursor-pointer border border-gray-200 bg-white"
      whileHover={{ y: -10 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out grayscale group-hover:grayscale-0 group-hover:scale-105 blur-[2px] group-hover:blur-0"
        style={{ backgroundImage: `url(${image})` }}
      />

      {/* Frosted Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-white/80 backdrop-blur-md border-t border-white/50 p-6 flex flex-col justify-center transition-all duration-500 group-hover:bg-white/90">
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 mb-2">{role}</span>
        <h3 className="font-serif text-2xl text-[#0B1221]">{title}</h3>
        <div className="w-0 group-hover:w-full h-0.5 bg-[#0B1221] mt-4 transition-all duration-500" />
      </div>
    </motion.div>
  );
};

const TimelineNode = ({ active, onClick, label }) => (
  <div
    onClick={onClick}
    className="relative flex flex-col items-center cursor-pointer group"
  >
    <motion.div
      className={`w-4 h-4 rounded-full border-2 transition-colors duration-300 z-10 bg-[#F9F8F6] ${active ? 'border-[#C6A87C] bg-[#C6A87C]' : 'border-gray-300 group-hover:border-[#0B1221]'}`}
    />
    <span className={`absolute top-8 text-xs uppercase tracking-widest font-medium transition-colors duration-300 w-32 text-center ${active ? 'text-[#0B1221]' : 'text-gray-400'}`}>
      {label}
    </span>
  </div>
);

// --- Main Page ---
const Homepage = () => {
  const { scrollYProgress } = useScroll();
  const [activeStage, setActiveStage] = useState(0);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userId, fullName, avatar, roleName } = useSelector((state) => state.user);
  const [openProfile, setOpenProfile] = useState(false);
  const profileRef = useRef(null);
  useClickOutside(profileRef, () => setOpenProfile(false));

  const { initials, colorClass, shouldShowImage, setImageError } = useAvatar(fullName, avatar);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const stages = [
    { id: 0, label: "Formation", title: "Team Assembly", desc: "Algorithmic matching based on skills and personality." },
    { id: 1, label: "Briefing", title: "Project Scope", desc: "Standardized requirements and milestone definition." },
    { id: 2, label: "Execution", title: "Sprint Cycles", desc: "Agile workflow management with integrated oversight." },
    { id: 3, label: "Review", title: "Assessment", desc: "Automated rubric mapping and peer evaluation." },
  ];

  return (
    <div className="min-h-screen w-full relative">
      <GlobalStyles />
      <div className="noise-bg" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-12 py-6 flex justify-between items-center text-[#0B1221]">
        <div className="font-serif text-2xl tracking-tight">CollabSphere.</div>
        <div className="hidden md:flex gap-12 text-sm font-medium tracking-wide">
          <a href="#" className="hover:text-gray-600 transition-colors">Platform</a>
          <a href="#" className="hover:text-gray-600 transition-colors">Institutions</a>
          <a href="#" className="hover:text-gray-600 transition-colors">Research</a>
        </div>
        {userId ? (
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setOpenProfile(!openProfile)}
              className="flex items-center gap-3 pl-4 border-transparent border-2 rounded-full hover:border-orangeFpt-500 hover:rounded-full hover:border-2 hover:text-white hover:bg-orangeFpt-500 transition-all duration-300"
            >
              <div className='p-1 flex items-center gap-2'>
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium">{fullName}</p>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium text-white overflow-hidden ${colorClass} ring-2 ring-white shadow-sm`}>
                  {shouldShowImage ? (
                    <img
                      src={avatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                <ChevronDown size={16} className={`transition-transform duration-200 ${openProfile ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {openProfile && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-gray-50 mb-2">
                  <p className="text-sm font-medium text-gray-900">Signed in as</p>
                  <p className="text-sm text-gray-500 truncate">{fullName}</p>
                </div>

                <button
                  onClick={() => navigate(getRoleLandingRoute(roleName))}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </button>

                <div className="h-px bg-gray-50 my-2" />

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="text-sm font-medium border border-[#0B1221]/30 px-6 py-2 hover:bg-[#0B1221] hover:text-white transition-all duration-300">
            Sign In
          </Link>
        )}
      </nav>

      {/* 1. Hero Section */}
      <Section className="h-screen flex items-center pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full h-full items-center">
          {/* Left Content */}
          <div className="lg:col-span-5 space-y-12 z-20">
            <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl leading-[1.1] text-[#0B1221]">
              Orchestrating <br />
              <span className="italic">Academic</span> <br />
              Excellence.
            </h1>
            <p className="text-lg text-gray-600 max-w-md font-light leading-relaxed">
              The operating system for high-performance university collaboration.
              Precision, clarity, and institutional trust in one platform.
            </p>
            <button className="group relative px-8 py-4 border border-[#0B1221] text-[#0B1221] overflow-hidden transition-colors duration-300 hover:text-white">
              <div className="absolute inset-0 bg-[#0B1221] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out -z-10" />
              <span className="text-sm uppercase tracking-[0.2em] font-medium">Explore the OS</span>
            </button>
          </div>

          {/* Right Visual (3D) */}
          <div className="lg:col-span-7 h-[60vh] lg:h-full relative">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
              <Environment preset="studio" />
              <ambientLight intensity={0.5} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
              <GlassPrism />
            </Canvas>
          </div>
        </div>
      </Section>

      {/* 2. Workspaces Carousel */}
      <Section className="py-32 overflow-hidden">
        <div className="mb-16 pl-4 border-l-2 border-[#0B1221]">
          <h2 className="font-serif text-4xl text-[#0B1221]">Architectural Workspaces</h2>
          <p className="text-gray-500 mt-2 font-light">Designed for specific academic roles.</p>
        </div>

        <div className="flex gap-8 overflow-x-auto pb-12 hide-scrollbar pl-1">
          <WorkspaceCard
            title="The Lecture Hall"
            role="FOR LECTURERS"
            image="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800"
          />
          <WorkspaceCard
            title="The Laboratory"
            role="FOR STUDENTS"
            image="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800"
          />
          <WorkspaceCard
            title="The Archive"
            role="FOR ADMINS"
            image="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=800"
          />
          <WorkspaceCard
            title="The Boardroom"
            role="FOR GUESTS"
            image="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800"
          />
        </div>
      </Section>

      {/* 3. The Timeline */}
      <Section className="py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-4">
            <h2 className="font-serif text-4xl mb-6">The Lifecycle</h2>
            <p className="text-gray-600 font-light leading-relaxed mb-8">
              From formation to final review, every stage is tracked with audit-grade precision.
              Navigate the timeline to see the workflow.
            </p>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeStage}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="bg-white p-8 border border-gray-100 shadow-sm"
              >
                <div className="text-[#C6A87C] text-xs font-bold uppercase tracking-widest mb-2">
                  Stage 0{activeStage + 1}
                </div>
                <h3 className="font-serif text-2xl mb-4">{stages[activeStage].title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{stages[activeStage].desc}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="lg:col-span-8 flex flex-col justify-center relative">
            {/* The Line */}
            <div className="relative w-full h-px bg-gray-200 mt-8">
              <motion.div
                className="absolute top-0 left-0 h-full bg-[#C6A87C]"
                style={{ width: useTransform(scrollYProgress, [0.3, 0.6], ["0%", "100%"]) }}
              />

              {/* Nodes */}
              <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-4">
                {stages.map((stage, index) => (
                  <TimelineNode
                    key={stage.id}
                    label={stage.label}
                    active={activeStage === index}
                    onClick={() => setActiveStage(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* 4. AI Insights */}
      <Section className="py-32 bg-[#F5F5F7] -mx-6 md:-mx-12 px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 h-[400px]">
            <Canvas camera={{ position: [0, 5, 5], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <TopoMesh />
            </Canvas>
          </div>

          <div className="order-1 lg:order-2 space-y-8">
            <div className="inline-block px-3 py-1 border border-[#0B1221] rounded-full text-[10px] uppercase tracking-widest font-bold">
              Beta 2.0
            </div>
            <h2 className="font-serif text-5xl text-[#0B1221]">Intelligent Insights.</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4 group cursor-pointer">
                <div className="mt-1 w-2 h-2 bg-[#0B1221] rounded-full group-hover:bg-[#C6A87C] transition-colors" />
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-wide mb-1">Predictive Risk Analysis</h4>
                  <p className="text-gray-500 text-sm font-light">AI identifies team friction before it escalates.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 group cursor-pointer">
                <div className="mt-1 w-2 h-2 bg-[#0B1221] rounded-full group-hover:bg-[#C6A87C] transition-colors" />
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-wide mb-1">Automated Rubric Mapping</h4>
                  <p className="text-gray-500 text-sm font-light">Aligns student output with accreditation standards instantly.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* 5. Trust Seal */}
      <div className="bg-[#0B1221] text-white py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Canvas camera={{ position: [0, 0, 5] }}>
            <ParticleShield />
          </Canvas>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <div className="w-16 h-16 mx-auto border border-[#C6A87C] rounded-full flex items-center justify-center mb-8">
            <div className="w-12 h-12 border border-[#C6A87C] rounded-full flex items-center justify-center">
              <div className="w-1 h-1 bg-[#C6A87C] rounded-full" />
            </div>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl mb-6">Audit-ready at every milestone.</h2>
          <p className="text-gray-400 font-light text-lg max-w-2xl mx-auto">
            Secure, immutable, and transparent. CollabSphere is built to meet the rigorous standards of modern academia.
          </p>
        </div>
      </div>

      {/* 6. Footer */}
      <footer className="bg-white pt-24 pb-12 border-t border-gray-200">
        <Section>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-2">
              <h3 className="font-serif text-3xl mb-6">CollabSphere.</h3>
              <p className="text-gray-500 font-light max-w-xs mb-8">
                Elevating the standard of collaborative education technology.
              </p>
              <button className="text-sm font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-[#C6A87C] hover:border-[#C6A87C] transition-colors">
                Request a Consultation
              </button>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Product</h4>
              <ul className="space-y-4 text-sm font-medium text-gray-600">
                <li><a href="#" className="hover:text-black">Features</a></li>
                <li><a href="#" className="hover:text-black">Security</a></li>
                <li><a href="#" className="hover:text-black">Integrations</a></li>
                <li><a href="#" className="hover:text-black">Changelog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Company</h4>
              <ul className="space-y-4 text-sm font-medium text-gray-600">
                <li><a href="#" className="hover:text-black">About</a></li>
                <li><a href="#" className="hover:text-black">Careers</a></li>
                <li><a href="#" className="hover:text-black">Legal</a></li>
                <li><a href="#" className="hover:text-black">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="flex justify-between items-center pt-8 border-t border-gray-100 text-xs text-gray-400 uppercase tracking-wider">
            <span>© 2025 CollabSphere Inc.</span>
            <div className="flex gap-6">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </Section>
      </footer>
    </div>
  );
};

export default Homepage;
