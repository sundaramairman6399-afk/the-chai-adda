
const menuItems = [
  {
    name: "Masala Chai",
    description: "Our signature Indian tea with aromatic spices.",
    price: "₹30",
    tag: "BESTSELLER",
    image:
      "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=700&q=85",
  },
  {
    name: "Kulhad Chai",
    description: "Traditional chai served in an earthy kulhad.",
    price: "₹40",
    tag: "CUSTOMER FAVOURITE",
    image:
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=700&q=85",
  },
  {
    name: "Sandwich",
    description: "Freshly prepared, delicious and full of flavour.",
    price: "₹60",
    tag: "POPULAR",
    image:
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=700&q=85",
  },
  {
    name: "Cold Coffee",
    description: "A refreshing, creamy coffee for every mood.",
    price: "₹80",
    tag: "MUST TRY",
    image:
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=700&q=85",
  },
];

function BrandLogo() {
  return (
    <a href="/" className="brand" aria-label="The Chai Adda home">
      <img
        src="/chai-adda-logo.jpg"
        alt="The Chai Adda logo"
        className="brand-logo"
      />
      <span className="brand-text">
        <span className="brand-name">
          THE CHAI <strong>ADDA</strong>
        </span>
        <small>FEEL THE TASTE OF KHULHAD</small>
      </span>
    </a>
  );
}

export default function Home() {
  return (
    <main>
      <div className="announcement">
        ☕ GOOD VIBES. GREAT CHAI. BETTER CONVERSATIONS.
      </div>

      {/* NAVBAR */}
      <header className="navbar">
        <div className="nav-container">
          <BrandLogo />

          <nav className="nav-links">
            <a href="#home">Home</a>
            <a href="/menu">Our Menu</a>
            <a href="#about">Our Story</a>
            <a href="#contact">Contact</a>
          </nav>

          <a href="/menu" className="nav-button">
            Explore Menu <span>↗</span>
          </a>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="hero" id="home">
        <div className="hero-content">
          <span className="eyebrow">
            YOUR EVERYDAY CHAI DESTINATION
          </span>

          <h1>
            Every Sip
            <br />
            Has A <span>Story.</span>
          </h1>

          <h2>Feel the Taste of Khulhad</h2>

          <p>
            More than just chai, it&apos;s a feeling. Come for the tea,
            stay for the conversations, and make every moment special.
          </p>

          <div className="hero-actions">
            <a href="/menu" className="primary-button">
              Explore Our Menu <span>→</span>
            </a>

            <a href="#about" className="secondary-button">
              Discover Our Story
            </a>
          </div>

          <div className="hero-note">
            <span className="note-line"></span>
            <span>BREWED FRESH. SERVED WITH LOVE.</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-image">
            <div className="image-caption">
              <span>THE CHAI ADDA EXPERIENCE</span>
              <strong>Your favourite place to unwind.</strong>
            </div>
          </div>

          <div className="hero-stamp">
            <span>CHAI</span>
            <strong>•</strong>
            <span>CONVERSATIONS</span>
            <strong>•</strong>
            <span>CONNECTIONS</span>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features">
        <div className="feature-item">
          <span className="feature-icon">☕</span>
          <div>
            <h3>Freshly Brewed</h3>
            <p>Made fresh for every cup.</p>
          </div>
        </div>

        <div className="feature-item">
          <span className="feature-icon">♡</span>
          <div>
            <h3>Made with Love</h3>
            <p>A little warmth in every sip.</p>
          </div>
        </div>

        <div className="feature-item">
          <span className="feature-icon">✦</span>
          <div>
            <h3>Good Vibes</h3>
            <p>Where every moment matters.</p>
          </div>
        </div>
      </section>

      {/* MENU PREVIEW */}
      <section className="menu-section" id="menu">
        <div className="section-heading">
          <span className="eyebrow">
            A LITTLE SOMETHING FOR EVERYONE
          </span>

          <h2>
            Our <span>Favourite</span> Picks
          </h2>

          <p>
            From a comforting cup of chai to your favourite bites,
            there&apos;s always something waiting for you.
          </p>
        </div>

        <div className="menu-grid">
          {menuItems.map((item) => (
            <article className="menu-card" key={item.name}>
              <div className="menu-image-wrap">
                <img
                  src={item.image}
                  alt={item.name}
                  className="menu-image"
                />
                <span className="menu-tag">{item.tag}</span>
              </div>

              <div className="menu-info">
                <div className="menu-title-row">
                  <h3>{item.name}</h3>
                  <strong>{item.price}</strong>
                </div>

                <p>{item.description}</p>

                <a href="/menu" className="menu-link">
                  Explore Menu <span>→</span>
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="menu-bottom">
          <p>GOOD FOOD. GREAT TEA. EVEN BETTER COMPANY.</p>

          <a href="/menu" className="text-link">
            View Full Menu <span>→</span>
          </a>
        </div>
      </section>

      {/* OUR STORY */}
      <section className="story-section" id="about">
        <div className="story-image">
          <div className="story-image-label">
            <span>EST. WITH LOVE</span>
            <strong>A place to call yours.</strong>
          </div>
        </div>

        <div className="story-content">
          <span className="eyebrow">
            MORE THAN JUST A TEA PLACE
          </span>

          <h2>
            Every Adda
            <br />
            Has A <span>Story.</span>
          </h2>

          <p>
            The Chai Adda is a place where a simple cup of chai turns
            into a memorable moment. It&apos;s about friends, laughter,
            conversations and the little breaks that make life better.
          </p>

          <p>
            Whether you are catching up with friends or taking a break
            from a busy day, there is always a place for you here.
          </p>

          <a href="#contact" className="primary-button">
            Come Say Hello <span>→</span>
          </a>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="cta-section">
        <span className="eyebrow">YOUR TABLE IS WAITING</span>

        <h2>
          Chai tastes better <span>together.</span>
        </h2>

        <p>
          Bring your friends, share a cup, and make some memories.
          We&apos;ll save a little warmth for you.
        </p>

        <a href="#contact" className="light-button">
          Find Your Way to Us <span>→</span>
        </a>
      </section>

      {/* FOOTER */}
      <footer className="footer" id="contact">
        <div className="footer-main">
          <div className="footer-brand">
            <BrandLogo />

            <p>
              A little chai, a lot of conversations, and memories
              worth coming back for.
            </p>
          </div>

          <div className="footer-column">
            <h3>Explore</h3>
            <a href="#home">Home</a>
            <a href="/menu">Our Menu</a>
            <a href="#about">Our Story</a>
          </div>

          <div className="footer-column">
            <h3>Visit Us</h3>
            <p>Come over and enjoy your favourite chai.</p>
            <a href="#contact">Contact The Chai Adda</a>
          </div>

          <div className="footer-column">
            <h3>Our Promise</h3>
            <p>Fresh chai. Warm moments. Happy conversations.</p>

            <span className="footer-highlight">
              FEEL THE TASTE OF KHULHAD
            </span>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 The Chai Adda. All rights reserved.</p>
          <p>MADE WITH ♡ AND A CUP OF CHAI.</p>
        </div>
      </footer>
    </main>
  );
}
