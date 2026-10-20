import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Wifi,
  Tv,
  Smartphone,
  PhoneCall,
  Check,
  ArrowRight,
  Zap,
  Headphones,
  ShieldCheck,
  Sparkles,
  Search,
  CheckCircle2,
  ChevronDown,
  DownloadCloud,
  UploadCloud,
  Film,
  Award,
  Layers,
  Clock,
  Radio,
} from "lucide-react";

import broadbandImage from "../assets/broadband.png";
import tvImage from "../assets/tv.png";
import ottImage from "../assets/ott-entertainment.png";
import communicationImage from "../assets/communication.png";
import "./Services.css";

function Services() {
  const location = useLocation();

  // Billing cycle state: 1m, 3m, 6m, 12m
  const [billingCycle, setBillingCycle] = useState("1m");

  // Active category filter: all, broadband, tv, ott, business
  const [activeCategory, setActiveCategory] = useState("all");

  // Availability checker state
  const [areaInput, setAreaInput] = useState("");
  const [checkResult, setCheckResult] = useState(null);

  // FAQ Accordion state
  const [openFaq, setOpenFaq] = useState(0);

  // Smooth scroll when hash is provided in URL
  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace("#", "");
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        setTimeout(() => {
          targetElement.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [location]);

  // Price calculations based on duration
  const getPlanPrice = (monthlyBase) => {
    switch (billingCycle) {
      case "3m":
        return {
          price: Math.round(monthlyBase * 0.95),
          total: Math.round(monthlyBase * 0.95 * 3),
          period: "/mo (billed quarterly)",
          savings: "Save 5%",
          original: monthlyBase,
        };
      case "6m":
        return {
          price: Math.round(monthlyBase * 0.9),
          total: Math.round(monthlyBase * 0.9 * 6),
          period: "/mo (billed 6 months)",
          savings: "Save 10% + Free Install",
          original: monthlyBase,
        };
      case "12m":
        return {
          price: Math.round(monthlyBase * 0.8),
          total: Math.round(monthlyBase * 0.8 * 12),
          period: "/mo (billed annually)",
          savings: "Save 20% + Free Wi-Fi 6 Router",
          original: monthlyBase,
        };
      default:
        return {
          price: monthlyBase,
          total: monthlyBase,
          period: "/month",
          savings: null,
          original: null,
        };
    }
  };

  // Broadband fiber plans
  const broadbandPlans = [
    {
      id: "silver-50",
      tier: "Silver Starter",
      speed: "50",
      unit: "Mbps",
      basePrice: 499,
      description: "Fast and stable connection for work-from-home, web browsing & study.",
      popular: false,
      features: [
        "50 Mbps Symmetric Speed (Upload & Download)",
        "Truly Unlimited High-Speed Data",
        "Free Dual-Band Wi-Fi Router Setup",
        "Low Latency Gaming (< 10ms Ping)",
        "24/7 Dedicated Local Helpdesk Support",
      ],
      ottApps: [],
    },
    {
      id: "gold-100",
      tier: "Gold Streamer",
      speed: "100",
      unit: "Mbps",
      basePrice: 699,
      description: "Most popular family plan for simultaneous 4K streaming & video calls.",
      popular: true,
      popularLabel: "MOST POPULAR CHOICE",
      features: [
        "100 Mbps Symmetric Gigabit Speed",
        "Truly Unlimited Data (No FUP Limit)",
        "Zero Buffering 4K UHD Multi-device Streaming",
        "Free Dual-Band Gigabit Wi-Fi Router",
        "6 Top OTT Apps Included",
        "Priority Doorstep Support in Eluru",
      ],
      ottApps: ["Aha Telugu", "ZEE5", "SonyLIV", "SunNXT"],
    },
    {
      id: "diamond-200",
      tier: "Diamond Ultra",
      speed: "200",
      unit: "Mbps",
      basePrice: 999,
      description: "High-performance power plan for pro gaming, creators & smart homes.",
      popular: false,
      features: [
        "200 Mbps Blazing Fast Fiber Speed",
        "Truly Unlimited High-Speed Data",
        "Sub-5ms Ultra-Low Latency for Esports",
        "Free Wi-Fi 6 High-Gain Router on 6M+",
        "12 Premium OTT Apps Included",
        "Disney+ Hotstar Super Subscription",
        "VIP 2-Hour Rapid Resolution SLA",
      ],
      ottApps: ["Disney+ Hotstar", "Aha Telugu", "SonyLIV", "ZEE5", "SunNXT", "Fancode"],
    },
    {
      id: "platinum-300",
      tier: "Platinum Giga",
      speed: "300",
      unit: "Mbps",
      basePrice: 1499,
      description: "Ultimate enterprise-grade fiber experience for luxury homes & offices.",
      popular: false,
      features: [
        "300 Mbps Supersonic Gigabit Speeds",
        "Truly Unlimited High-Speed Bandwidth",
        "Supports 25+ Connected Smart Devices",
        "Free Premium Wi-Fi 6 Mesh Router",
        "16 Premium OTT Apps + Hotstar Premium",
        "Static IP Address Available on Request",
        "Dedicated Account Manager & 24/7 VIP SLA",
      ],
      ottApps: ["Disney+ Hotstar", "SonyLIV", "ZEE5", "Aha Telugu", "SunNXT", "Discovery+", "Lionsgate"],
    },
  ];

  // Digital TV plans
  const tvPlans = [
    {
      id: "tv-basic",
      name: "TV Starter Pack",
      channels: "150+ Channels",
      hdChannels: "25+ HD Channels",
      price: 199,
      description: "Perfect pack for essential regional news, Telugu entertainment & devotional channels.",
      genres: ["Telugu", "News", "Devotional", "Music"],
      popular: false,
      features: [
        "150+ Digital TV Channels",
        "Crisp 1080p Full HD Picture Quality",
        "Free Set-Top Box on 6-Month booking",
        "Crystal Clear Digital Dolby Audio",
        "Interactive Electronic Program Guide (EPG)",
      ],
    },
    {
      id: "tv-gold",
      name: "TV Gold HD Pack",
      channels: "250+ Channels",
      hdChannels: "60+ HD Channels",
      price: 299,
      description: "All top Telugu entertainment, blockbuster movie channels, kids and live sports in HD.",
      genres: ["Star Maa HD", "Zee Telugu HD", "ETV HD", "Sports 18", "Gemini HD"],
      popular: true,
      features: [
        "250+ Digital & HD TV Channels",
        "All Telugu Entertainment & Cinema in HD",
        "Live Cricket & Sports in High Definition",
        "Kids Cartoons, Discovery & National Geographic",
        "Regional South Indian Language Channels",
        "24/7 Doorstep Cable Technician Support",
      ],
    },
    {
      id: "tv-platinum",
      name: "TV Platinum Mega Pack",
      channels: "350+ Channels",
      hdChannels: "95+ HD Channels",
      price: 399,
      description: "The complete entertainment kingdom with international cinema, all sports & lifestyle.",
      genres: ["All HD Sports", "Hollywood HD", "Infotainment", "Kids Mega", "South All"],
      popular: false,
      features: [
        "350+ Total Digital Channels",
        "95+ Premium Full HD Channels",
        "Complete Star, Sony & Sports Networks",
        "English Cinema, Premium Music & News",
        "Parental Lock & Multi-Audio Language Support",
        "Priority Customer Support Assistance",
      ],
    },
  ];

  // OTT streaming apps list
  const ottPartners = [
    { name: "Disney+ Hotstar", tag: "Live Cricket & Movies" },
    { name: "Aha Video", tag: "100% Telugu Entertainment" },
    { name: "SonyLIV", tag: "Sports & Premium Series" },
    { name: "ZEE5", tag: "Telugu & Regional Hits" },
    { name: "Sun NXT", tag: "Blockbuster South Movies" },
    { name: "Discovery+", tag: "Documentaries & Science" },
    { name: "Lionsgate Play", tag: "Hollywood Cinema" },
    { name: "FanCode", tag: "Live Sports Streaming" },
  ];

  // Comparison Matrix Data
  const comparisonData = [
    { feature: "Internet Download & Upload Speed", silver: "50 Mbps Symmetric", gold: "100 Mbps Symmetric", diamond: "200 Mbps Symmetric", platinum: "300 Mbps Symmetric" },
    { feature: "Data Cap / FUP Limit", silver: "Truly Unlimited", gold: "Truly Unlimited", diamond: "Truly Unlimited", platinum: "Truly Unlimited" },
    { feature: "Wi-Fi Router Provided", silver: "Dual-Band Wi-Fi", gold: "Gigabit Dual-Band", diamond: "High-Gain Wi-Fi 6", platinum: "Wi-Fi 6 Mesh Ready" },
    { feature: "OTT Subscriptions Included", silver: "Add-on Available", gold: "6 Premium OTTs", diamond: "12 OTTs + Hotstar", platinum: "16 OTTs All-Inclusive" },
    { feature: "Digital TV Channels Add-on", silver: "Available at ₹150", gold: "Available at ₹150", diamond: "Bundled Free", platinum: "Bundled Free" },
    { feature: "Gaming Ping Latency", silver: "< 15ms", gold: "< 10ms", diamond: "< 5ms (Pro Gaming)", platinum: "< 3ms (Esports Tier)" },
    { feature: "Installation Fee (6M+ Booking)", silver: "FREE (100% Waived)", gold: "FREE (100% Waived)", diamond: "FREE (100% Waived)", platinum: "FREE (100% Waived)" },
    { feature: "Customer Support SLA", silver: "Standard 24/7", gold: "Priority Support", diamond: "VIP 2-Hour SLA", platinum: "VIP 1-Hour SLA" },
  ];

  // FAQ list
  const faqData = [
    {
      q: "How fast can I get a new GSR Broadband or TV connection installed?",
      a: "Once you submit your booking online or over phone, our local Eluru fiber installation team visits your doorstep within 2 to 4 hours. Most connections are powered up and running on the very same day!",
    },
    {
      q: "Is the broadband data truly unlimited with no speed drops?",
      a: "Yes! All GSR Broadband fiber plans provide true unlimited data with symmetric upload and download speeds. There is no hidden throttling or slow-down at the end of the month.",
    },
    {
      q: "Do I get a free Wi-Fi router with my plan?",
      a: "Yes! When you subscribe to our 6-month or annual plans, you receive a complimentary high-performance Dual-Band Wi-Fi Gigabit router configured and tested by our certified technicians with zero equipment rental fees.",
    },
    {
      q: "How do I activate the OTT subscriptions included with my plan?",
      a: "After your fiber connection is activated, you will receive an SMS and WhatsApp link on your registered mobile number. You can instantly log into Disney+ Hotstar, Aha, Zee5, and SonyLIV using your registered mobile OTP without paying extra.",
    },
    {
      q: "Can I upgrade or change my plan anytime?",
      a: "Absolutely! You can easily upgrade your speed or add TV and OTT packs at any time through our customer portal, WhatsApp support, or by calling our Eluru service desk.",
    },
  ];

  // Handle availability checker submit
  const handleCheckArea = (e) => {
    e.preventDefault();
    if (!areaInput.trim()) return;

    // Simulate instant area verification for Eluru & nearby
    setCheckResult({
      status: "active",
      area: areaInput.trim(),
      message: "Great news! GSR High-Speed Fiber Network is fully active in your area with Same-Day 2-Hour Installation available!",
    });
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="services-page-container">
      {/* =========================================================
          HERO BANNER
      ========================================================= */}
      <section className="sp-hero">
        <div className="sp-hero-pattern"></div>
        <div className="sp-hero-inner">
          <div className="sp-badge">
            <Sparkles size={14} />
            GSR FIBER & DIGITAL ENTERTAINMENT
          </div>

          <h1>
            Ultra-Fast Speeds.
            <br />
            <span>Unmatched Entertainment Plans.</span>
          </h1>

          <p>
            Experience lightning-fast optical fiber broadband, 350+ HD digital TV channels,
            and 16+ blockbuster OTT subscriptions—crafted for smart homes, gamers, and growing businesses in Eluru.
          </p>

          <div className="sp-hero-actions">
            <button
              onClick={() => scrollToSection("broadband-plans")}
              className="sp-btn-primary"
            >
              <Zap size={18} />
              EXPLORE FIBER PLANS
            </button>

            <button
              onClick={() => scrollToSection("availability-checker")}
              className="sp-btn-outline"
            >
              <Search size={18} />
              CHECK AREA COVERAGE
            </button>
          </div>

          {/* Quick Trust Strip */}
          <div className="sp-trust-strip">
            <div className="sp-trust-item">
              <div className="sp-trust-icon">
                <Wifi size={22} />
              </div>
              <div className="sp-trust-text">
                <strong>Up to 300 Mbps</strong>
                <span>Pure FTTH Fiber</span>
              </div>
            </div>

            <div className="sp-trust-item">
              <div className="sp-trust-icon">
                <Tv size={22} />
              </div>
              <div className="sp-trust-text">
                <strong>350+ Channels</strong>
                <span>Full HD Cable TV</span>
              </div>
            </div>

            <div className="sp-trust-item">
              <div className="sp-trust-icon">
                <Film size={22} />
              </div>
              <div className="sp-trust-text">
                <strong>16+ OTT Apps</strong>
                <span>Aha, Hotstar & More</span>
              </div>
            </div>

            <div className="sp-trust-item">
              <div className="sp-trust-icon">
                <ShieldCheck size={22} />
              </div>
              <div className="sp-trust-text">
                <strong>99.9% Uptime</strong>
                <span>Symmetric Low Latency</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          STICKY CATEGORY FILTER / SUB-NAVIGATION
      ========================================================= */}
      <nav className="sp-subnav-sticky" aria-label="Services navigation">
        <div className="sp-subnav-container">
          <div className="sp-tab-list">
            <button
              className={`sp-tab-btn ${activeCategory === "all" ? "active" : ""}`}
              onClick={() => {
                setActiveCategory("all");
                scrollToSection("broadband-plans");
              }}
            >
              <Layers size={16} />
              All Services
            </button>

            <button
              className={`sp-tab-btn ${activeCategory === "broadband" ? "active" : ""}`}
              onClick={() => {
                setActiveCategory("broadband");
                scrollToSection("broadband-plans");
              }}
            >
              <Wifi size={16} />
              Fiber Broadband
            </button>

            <button
              className={`sp-tab-btn ${activeCategory === "ott" ? "active" : ""}`}
              onClick={() => {
                setActiveCategory("ott");
                scrollToSection("ott-combos");
              }}
            >
              <Smartphone size={16} />
              OTT Combos
            </button>

            <button
              className={`sp-tab-btn ${activeCategory === "tv" ? "active" : ""}`}
              onClick={() => {
                setActiveCategory("tv");
                scrollToSection("tv-plans");
              }}
            >
              <Tv size={16} />
              Digital Cable TV
            </button>

            <button
              className="sp-tab-btn"
              onClick={() => scrollToSection("plan-comparison")}
            >
              <Award size={16} />
              Compare Plans
            </button>

            <button
              className="sp-tab-btn"
              onClick={() => scrollToSection("faqs")}
            >
              <Clock size={16} />
              FAQs
            </button>
          </div>

          <div className="sp-subnav-help">
            <PhoneCall size={16} />
            <span>Need Help? Call: 08812-234567</span>
          </div>
        </div>
      </nav>

      {/* =========================================================
          BILLING DURATION SELECTOR (DISCOUNT TOGGLE)
      ========================================================= */}
      <section className="sp-billing-section">
        <div className="sp-billing-box">
          <button
            className={`sp-billing-btn ${billingCycle === "1m" ? "active" : ""}`}
            onClick={() => setBillingCycle("1m")}
          >
            Monthly
          </button>

          <button
            className={`sp-billing-btn ${billingCycle === "3m" ? "active" : ""}`}
            onClick={() => setBillingCycle("3m")}
          >
            3 Months
            <span className="sp-discount-pill">Save 5%</span>
          </button>

          <button
            className={`sp-billing-btn ${billingCycle === "6m" ? "active" : ""}`}
            onClick={() => setBillingCycle("6m")}
          >
            6 Months
            <span className="sp-free-tag">Free Install + 10% OFF</span>
          </button>

          <button
            className={`sp-billing-btn ${billingCycle === "12m" ? "active" : ""}`}
            onClick={() => setBillingCycle("12m")}
          >
            Annual (12M)
            <span className="sp-free-tag">Free Router + 20% OFF</span>
          </button>
        </div>
      </section>

      <section className="sp-plans-section" id="broadband">
        <div className="sp-section-heading">
          <span className="sp-section-tag">HIGH-SPEED OPTICAL FIBER</span>
          <h2>
            Choose Your <span>Broadband Plan</span>
          </h2>
          <p>
            Zero buffering, ultra-low latency, and true symmetric upload & download speeds.
            Pick the speed that suits your lifestyle.
          </p>
        </div>

        <div className="sp-plans-grid">
          {broadbandPlans.map((plan) => {
            const pricing = getPlanPrice(plan.basePrice);

            return (
              <div
                key={plan.id}
                className={`sp-plan-card ${plan.popular ? "is-popular" : ""}`}
              >
                {plan.popular && (
                  <div className="sp-popular-banner">
                    <Sparkles size={13} style={{ display: "inline", marginRight: "4px" }} />
                    {plan.popularLabel}
                  </div>
                )}

                <div className="sp-plan-top">
                  <div className="sp-plan-header-row">
                    <span className="sp-plan-tier-name">{plan.tier}</span>
                    <div className="sp-plan-icon-wrap">
                      <Wifi size={20} />
                    </div>
                  </div>

                  <div className="sp-speed-display">
                    <span className="sp-speed-number">{plan.speed}</span>
                    <span className="sp-speed-unit">{plan.unit}</span>
                  </div>

                  <p className="sp-speed-desc">{plan.description}</p>

                  <div className="sp-price-box">
                    <span className="sp-price-amount">₹{pricing.price}</span>
                    <span className="sp-price-billing">{pricing.period}</span>
                    {pricing.original && (
                      <span className="sp-price-original">₹{pricing.original}</span>
                    )}
                  </div>

                  {pricing.savings && (
                    <span className="sp-savings-label">{pricing.savings}</span>
                  )}
                </div>

                <div className="sp-plan-features-list">
                  {plan.features.map((feat, idx) => (
                    <div className="sp-feature-item" key={idx}>
                      <CheckCircle2 size={16} className="sp-feature-icon" />
                      <span>{feat}</span>
                    </div>
                  ))}

                  {plan.ottApps.length > 0 && (
                    <div className="sp-ott-tags">
                      <div className="sp-ott-tags-title">OTT Apps Included:</div>
                      <div className="sp-ott-pills">
                        {plan.ottApps.map((ott, i) => (
                          <span
                            key={i}
                            className={`sp-ott-pill ${
                              ott.toLowerCase().includes("hotstar")
                                ? "hotstar"
                                : ott.toLowerCase().includes("aha")
                                ? "aha"
                                : ott.toLowerCase().includes("sony")
                                ? "sonyliv"
                                : "zee5"
                            }`}
                          >
                            {ott}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="sp-plan-footer">
                  <Link
                    to={`/book-connection?plan=${plan.id}`}
                    className="sp-select-btn"
                  >
                    <span>SELECT PLAN</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="sp-ott-bundle-section" id="ott">
        <div className="sp-bundle-container">
          <div className="sp-bundle-left">
            <span className="sp-section-tag">ALL-IN-ONE STREAMING & TV</span>
            <h2>
              Broadband + TV + 16 OTT Apps
              <br />
              <strong>All In One Single Bill</strong>
            </h2>
            <p>
              Why pay separate bills for internet, cable TV, and multiple OTT subscriptions?
              With GSR All-in-One Entertainment combos, get high-speed fiber wi-fi, 350+ HD channels,
              and premier streaming platforms bundled with massive monthly savings!
            </p>

            <div className="sp-ott-logos-grid">
              {ottPartners.map((partner, index) => (
                <div key={index} className="sp-ott-brand-card">
                  <strong>{partner.name}</strong>
                  <span>{partner.tag}</span>
                </div>
              ))}
            </div>

            <Link
              to="/book-connection?plan=gold-100"
              className="sp-btn-primary"
              style={{ background: "#0b914f", color: "#ffffff" }}
            >
              <span>GET ENTERTAINMENT COMBO</span>
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="sp-bundle-right">
            <div className="sp-bundle-highlight-card">
              <div className="sp-bundle-badge-top">MEGA VALUE BUNDLE</div>

              <div className="sp-bundle-card-header">
                <h3>GSR Ultimate Entertainment Pack</h3>
                <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>
                  Complete fiber connectivity & limitless entertainment for the entire family.
                </p>
              </div>

              <div className="sp-bundle-card-price">
                <strong>₹899</strong>
                <span style={{ color: "#64748b", fontSize: "14px" }}>/month + taxes</span>
              </div>

              <div className="sp-bundle-perks">
                <div className="sp-perk-item">
                  <Check size={18} />
                  <span>100 Mbps True Unlimited Fiber Internet</span>
                </div>

                <div className="sp-perk-item">
                  <Check size={18} />
                  <span>250+ HD Digital Cable TV Channels</span>
                </div>

                <div className="sp-perk-item">
                  <Check size={18} />
                  <span>Disney+ Hotstar, Aha, Zee5 & SonyLIV Included</span>
                </div>

                <div className="sp-perk-item">
                  <Check size={18} />
                  <span>Free Dual-Band Gigabit Wi-Fi Router</span>
                </div>

                <div className="sp-perk-item">
                  <Check size={18} />
                  <span>Free Setup & 24/7 Priority Doorstep Support</span>
                </div>
              </div>

              <Link
                to="/book-connection?plan=ultimate-899"
                className="sp-select-btn"
                style={{
                  background: "#0b914f",
                  color: "#ffffff",
                  padding: "16px",
                  fontSize: "14px",
                }}
              >
                <span>BOOK THIS BUNDLE NOW</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="sp-tv-section" id="tv">
        <div className="sp-section-heading">
          <span className="sp-section-tag">CRYSTAL CLEAR PICTURE & SOUND</span>
          <h2>
            Digital Cable <span>TV Plans</span>
          </h2>
          <p>
            Enjoy uninterrupted entertainment with 350+ digital channels, crystal clear HD audio-visuals,
            and all your favorite Telugu, sports, and cinema channels.
          </p>
        </div>

        <div className="sp-tv-grid">
          {tvPlans.map((plan) => (
            <div
              key={plan.id}
              className={`sp-tv-card ${plan.popular ? "is-popular" : ""}`}
            >
              <div className="sp-tv-image-box">
                <img src={tvImage} alt={plan.name} />
                <span className="sp-tv-channel-tag">{plan.channels}</span>
              </div>

              <div className="sp-tv-body">
                <div className="sp-tv-title-row">
                  <h3>{plan.name}</h3>
                  {plan.popular && (
                    <span className="sp-discount-pill">POPULAR</span>
                  )}
                </div>

                <div className="sp-tv-price">
                  ₹{plan.price} <span>/month</span>
                </div>

                <div className="sp-tv-genres">
                  {plan.genres.map((g, i) => (
                    <span key={i} className="sp-tv-genre-pill">
                      {g}
                    </span>
                  ))}
                </div>

                <div className="sp-tv-features">
                  {plan.features.map((feat, i) => (
                    <div key={i} className="sp-tv-feat">
                      <Check size={16} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <Link
                  to={`/book-connection?plan=${plan.id}`}
                  className="sp-select-btn"
                >
                  <span>GET THIS TV PACK</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================
          AVAILABILITY CHECKER TOOL
      ========================================================= */}
      <section className="sp-checker-section" id="availability-checker">
        <div className="sp-checker-card">
          <div className="sp-checker-content">
            <span className="sp-badge" style={{ background: "rgba(255,255,255,0.18)" }}>
              ⚡ QUICK VERIFICATION
            </span>
            <h3>Check Fiber Availability in Your Area</h3>
            <p>
              Enter your colony, street name, or pincode in Eluru & surrounding areas
              to verify instant network connectivity and installation slots.
            </p>

            <form onSubmit={handleCheckArea} className="sp-checker-form">
              <div className="sp-checker-input-wrap">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="e.g. Powerpet, R.R. Pet, Sanivarapupeta, 534002..."
                  value={areaInput}
                  onChange={(e) => setAreaInput(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="sp-checker-btn">
                CHECK AVAILABILITY
              </button>
            </form>

            {checkResult && (
              <div className="sp-checker-result success">
                <CheckCircle2 size={22} style={{ color: "#86efac", flexShrink: 0 }} />
                <span>
                  <strong>{checkResult.area}:</strong> {checkResult.message}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================
          PLAN COMPARISON MATRIX
      ========================================================= */}
      <section className="sp-comparison-section" id="plan-comparison">
        <div className="sp-section-heading">
          <span className="sp-section-tag">TRANSPARENT & CLEAR</span>
          <h2>
            Detailed <span>Plan Comparison</span>
          </h2>
          <p>
            Compare features across all fiber speed tiers side by side to pick the exact right plan for your home.
          </p>
        </div>

        <div className="sp-table-wrapper">
          <table className="sp-compare-table">
            <thead>
              <tr>
                <th>Plan Features</th>
                <th>Silver (50 Mbps)</th>
                <th className="featured-col">Gold (100 Mbps) ★</th>
                <th>Diamond (200 Mbps)</th>
                <th>Platinum (300 Mbps)</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, idx) => (
                <tr key={idx}>
                  <td>
                    <strong>{row.feature}</strong>
                  </td>
                  <td>{row.silver}</td>
                  <td className="featured-col">{row.gold}</td>
                  <td>{row.diamond}</td>
                  <td>{row.platinum}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* =========================================================
          WHY CHOOSE GSR FIBER
      ========================================================= */}
      <section className="sp-why-section">
        <div className="sp-section-heading">
          <span className="sp-section-tag">THE GSR ADVANTAGE</span>
          <h2>
            Why 10,000+ Customers <span>Trust GSR</span>
          </h2>
          <p>
            We combine high-speed optical fiber infrastructure with unmatched local customer service.
          </p>
        </div>

        <div className="sp-why-grid">
          <div className="sp-why-card">
            <div className="sp-why-icon-box">
              <Zap size={26} />
            </div>
            <h3>100% Pure FTTH Fiber</h3>
            <p>
              Dedicated optical fiber lines delivered right into your living room for zero line interference
              and maximum speed consistency.
            </p>
          </div>

          <div className="sp-why-card">
            <div className="sp-why-icon-box">
              <Radio size={26} />
            </div>
            <h3>Symmetric Speeds</h3>
            <p>
              Equal upload and download speeds ensure seamless video conferences, fast cloud backups,
              and smooth multi-player gaming.
            </p>
          </div>

          <div className="sp-why-card">
            <div className="sp-why-icon-box">
              <Headphones size={26} />
            </div>
            <h3>2-Hour Local Doorstep SLA</h3>
            <p>
              Our local technician fleet is stationed directly across Eluru to resolve any cable or router
              inquiries quickly and in-person.
            </p>
          </div>

          <div className="sp-why-card">
            <div className="sp-why-icon-box">
              <ShieldCheck size={26} />
            </div>
            <h3>Weather-Proof Reliability</h3>
            <p>
              Built with durable underground fiber networks that stay connected through heavy rains and seasonal storms.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          FREQUENTLY ASKED QUESTIONS (ACCORDION)
      ========================================================= */}
      <section className="sp-faq-section" id="faqs">
        <div className="sp-section-heading">
          <span className="sp-section-tag">GOT QUESTIONS?</span>
          <h2>
            Frequently Asked <span>Questions</span>
          </h2>
          <p>
            Here are answers to the most common queries regarding our broadband and digital TV services.
          </p>
        </div>

        <div className="sp-faq-list">
          {faqData.map((faq, index) => {
            const isOpen = openFaq === index;

            return (
              <div
                key={index}
                className={`sp-faq-item ${isOpen ? "is-open" : ""}`}
              >
                <button
                  className="sp-faq-question"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={20} className="sp-faq-toggle-icon" />
                </button>

                {isOpen && <div className="sp-faq-answer">{faq.a}</div>}
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================
          FINAL CALL TO ACTION BANNER
      ========================================================= */}
      <section className="sp-cta-section" id="phone">
        <div className="sp-cta-container">
          <div className="sp-cta-text">
            <h2>Ready To Upgrade Your Internet Experience?</h2>
            <p>
              Get high-speed fiber broadband and HD digital cable TV installed today.
              Our friendly local team in Eluru is ready to get you connected!
            </p>
          </div>

          <div className="sp-cta-buttons">
            <a href="tel:08812234567" className="sp-cta-call-btn">
              <PhoneCall size={18} />
              CALL: 08812-234567
            </a>

            <Link to="/book-connection" className="sp-cta-book-btn">
              BOOK CONNECTION ONLINE
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Services;