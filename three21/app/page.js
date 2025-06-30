import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-16">
        {/* Header */}
        <header className="text-center mb-16 animate-fadeIn">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary mb-6">
            Three21
          </h1>
          <p className="text-lg md:text-xl text-secondary max-w-3xl mx-auto">
            Advanced 3D model visualization and analysis platform. Upload, explore, and dissect your 3D models with cutting-edge technology.
          </p>
        </header>

        {/* Bento Grid Layout */}
        <div className="bento-grid mb-16">
          {/* Main CTA Card */}
          <div className="bento-main card p-8 flex flex-col justify-between">
            <div>
              <div className="feature-icon feature-icon-primary mb-6">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
                Start Exploring
              </h2>
              <p className="text-lg text-secondary mb-8">
                Upload your 3D models and experience next-generation visualization. Support for GLB, GLTF, FBX, and more formats with real-time rendering capabilities.
              </p>
            </div>
            <Link 
              href="/import-model"
              className="btn btn-primary btn-lg inline-flex items-center gap-2"
            >
              Upload Model
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="bento-feature card p-6">
            <div className="feature-icon feature-icon-secondary mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-primary mb-3">Real-time Rendering</h3>
            <p className="text-secondary">
              High-performance WebGL rendering with advanced lighting, shadows, and materials for stunning visual quality.
            </p>
          </div>

          <div className="bento-feature card p-6">
            <div className="feature-icon feature-icon-info mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-primary mb-3">Interactive Analysis</h3>
            <p className="text-secondary">
              Inspect models with advanced tools, layer management, and precise dissection capabilities for detailed examination.
            </p>
          </div>

          <div className="bento-feature card p-6">
            <div className="feature-icon feature-icon-success mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-primary mb-3">Multi-format Support</h3>
            <p className="text-secondary">
              GLB, GLTF, FBX, OBJ, and more. Seamless format conversion and optimization for all your 3D assets.
            </p>
          </div>

          <div className="bento-feature card p-6">
            <div className="feature-icon feature-icon-primary mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-primary mb-3">AI-Powered Insights</h3>
            <p className="text-secondary">
              Get intelligent analysis, optimization suggestions, and automated reports for your 3D models.
            </p>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="card p-8 mb-16">
          <div className="stats-grid">
            <div>
              <div className="stat-number stat-number-primary">10+</div>
              <div className="text-lg text-secondary">Supported Formats</div>
            </div>
            <div>
              <div className="stat-number stat-number-secondary">Real-time</div>
              <div className="text-lg text-secondary">Rendering Engine</div>
            </div>
            <div>
              <div className="stat-number stat-number-success">Advanced</div>
              <div className="text-lg text-secondary">Analysis Tools</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-secondary text-lg">
          <p>Built with Three.js, Next.js, and cutting-edge WebGL technology</p>
        </footer>
      </div>
    </div>
  );
}
