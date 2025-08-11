import React from "react";

// You can place this CSS in your main CSS file (e.g., App.css)
// or use a <style> tag in your main HTML file.
const galleryStyles = `
  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-auto-rows: minmax(180px, auto);
    gap: 1.5rem;
    max-width: 1200px;
    margin: 2rem auto;
    padding: 0 1rem;
  }

  .gallery-item {
    background-color: #f0f0f0;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .gallery-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  }

  .gallery-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .item-span-2-rows {
    grid-row: span 2;
  }

  .item-span-2-cols {
    grid-column: span 2;
  }
  
  .text-block {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    text-align: center;
    background-color: #cb4335; /* Using the red from your site */
    color: white;
  }

  .text-block h3 {
    font-size: 1.5rem;
    margin: 0;
  }

  /* Responsive styles for mobile */
  @media (max-width: 768px) {
    .gallery-grid {
      grid-template-columns: 1fr;
      grid-auto-rows: auto;
    }

    .item-span-2-rows,
    .item-span-2-cols {
      grid-row: auto;
      grid-column: auto;
    }
    
    .text-block {
      min-height: 180px;
    }
  }
`;

const ServicesGallery = () => {
  return (
    <>
      {/* Add the styles to your component or a global CSS file */}
      <style>{galleryStyles}</style>

      <section
        style={{
          padding: "50px 0",
          textAlign: "center",
          backgroundColor: "#f9f9f9",
        }}
      >
        <h2 style={{ fontSize: "2.5rem", marginBottom: "10px", color: "#333" }}>
          Our Impactful Services
        </h2>
        <p
          style={{
            fontSize: "1.1rem",
            color: "#666",
            maxWidth: "600px",
            margin: "0 auto 2rem",
          }}
        >
          Through community support and dedicated efforts, we provide essential
          services to uplift and empower those in need.
        </p>

        <div className="gallery-grid">
          {/* Item 1: Education Image (Tall) */}
          <div className="gallery-item item-span-2-rows">
            <img
              src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=656,h=470,fit=crop/Yyv7OP8VjEfPoXX1/1030385-education-m5KbZ84k3acOl2zZ.jpg"
              alt="Children studying outdoors"
            />
          </div>

          {/* Item 2: Free Education Text Block */}
          <div className="gallery-item text-block">
            <h3>Free Education</h3>
          </div>

          {/* Item 3: Medical Camp Image (Wide) */}
          <div className="gallery-item item-span-2-cols">
            <img
              src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=656,h=470,fit=crop/Yyv7OP8VjEfPoXX1/medical-camp-Yley94ZgERs4ZOaL.jpg"
              alt="Medical camp services"
            />
          </div>

          {/* Item 4: Education Image 2 */}
          <div className="gallery-item">
            <img
              src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=656,h=470,fit=crop/Yyv7OP8VjEfPoXX1/library-dJo4aLb63NhVKBZ3.jpeg"
              alt="Students in a library"
            />
          </div>

          {/* Item 5: Medical Camp Text Block */}
          <div className="gallery-item text-block">
            <h3>Medical Camp</h3>
          </div>

          {/* Item 6: Medical Camp Image 2 */}
          <div className="gallery-item">
            <img
              src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=656,h=470,fit=crop/Yyv7OP8VjEfPoXX1/free-medicines-A1aJ8zNExNfMv5M9.jpg"
              alt="Distribution of free medicines"
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default ServicesGallery;
