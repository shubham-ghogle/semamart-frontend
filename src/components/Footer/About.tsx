

const About = () => {
  return (
    <div className="bg-gray-50 text-gray-800 font-sans">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-400 text-white py-20 px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fadeIn">
            Transforming Healthcare Procurement
          </h1>
          <p className="text-lg md:text-xl text-blue-100 animate-fadeIn delay-100">
            At Semamart, we’re building a smarter, tech-driven marketplace that connects healthcare professionals with trusted medical supplies, equipment, and pharmaceuticals.
          </p>
        </div>
      </section>

      {/* About Us Section */}
      <section className="max-w-6xl mx-auto py-16 px-6 md:px-12">
        <h2 className="text-3xl font-bold text-center mb-8 text-blue-700">About Us</h2>
        <p className="text-lg leading-relaxed text-gray-700 text-center max-w-3xl mx-auto">
          Semamart is dedicated to revolutionizing the healthcare supply chain through innovation and technology. 
          We connect hospitals, clinics, and practitioners to a vast network of medical equipment, pharmaceuticals, and consumables.
          Our integrated platforms—<strong>MediGrid</strong>, <strong>SupplyRx</strong>, <strong>H-Intel</strong>, and <strong>AssetVue</strong>—empower the healthcare industry to deliver better patient outcomes with efficiency and cost-effectiveness.
        </p>
      </section>

      {/* Mission & Vision Section */}
      <section className="bg-white py-16 px-6 md:px-12">
        <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
          <div className="p-6 border-l-4 border-blue-500 bg-gray-50 rounded-lg shadow-sm">
            <h3 className="text-2xl font-semibold mb-4 text-blue-600">Our Mission</h3>
            <p className="text-gray-700 leading-relaxed">
              To revolutionize healthcare procurement by providing a seamless, end-to-end digital solution that enhances efficiency,
              reduces costs, and improves patient outcomes.
            </p>
          </div>
          <div className="p-6 border-l-4 border-green-500 bg-gray-50 rounded-lg shadow-sm">
            <h3 className="text-2xl font-semibold mb-4 text-green-600">Our Vision</h3>
            <p className="text-gray-700 leading-relaxed">
              To be the most trusted and innovative platform for healthcare professionals worldwide—fostering a future where every
              facility, regardless of size, can access the best medical supplies with ease.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 px-6 md:px-12">
        <h2 className="text-3xl font-bold text-center mb-12 text-blue-700">Why Choose Semamart</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {[
            {
              title: "Comprehensive Solutions",
              desc: "From essential medications to advanced equipment, our vast inventory meets every healthcare need.",
              icon: "💊",
            },
            {
              title: "Tech-Driven Innovation",
              desc: "We leverage AI and analytics to streamline procurement, ensuring timely and efficient delivery.",
              icon: "⚙️",
            },
            {
              title: "Trusted Quality",
              desc: "Partnered with leading manufacturers to guarantee the highest quality and safety standards.",
              icon: "🏥",
            },
            {
              title: "Customer-Centric",
              desc: "Our intuitive platform and personalized support ensure a seamless procurement experience.",
              icon: "🤝",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="p-6 bg-white shadow-lg rounded-lg text-center hover:shadow-xl transition-shadow duration-300"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h4 className="text-xl font-semibold text-blue-700 mb-2">
                {item.title}
              </h4>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-20 bg-blue-600 text-white">
        <h2 className="text-3xl font-bold mb-4">Join Us Today</h2>
        <p className="text-lg mb-8">
          Experience a smarter, faster, and more reliable way to manage your healthcare procurement needs.
        </p>
        <a
          href="/contact"
          className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg shadow hover:bg-blue-100 transition"
        >
          Get Started
        </a>
      </section>
    </div>
  );
};

export default About;
