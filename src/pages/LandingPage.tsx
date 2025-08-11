"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Truck,
  Settings,
  Award,
  Recycle,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { Link } from "react-router";
import { createEnquiryLead } from "@/services/sendMail";
import { toast } from "sonner";

export default function LandingPage() {
  const [enquiryForm, setEnquiryForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    company: "",
    message: "",
  });
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquiryError, setEnquiryError] = useState<string | null>(null);
  const [enquirySuccess, setEnquirySuccess] = useState<string | null>(null);

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnquiryError(null);
    setEnquirySuccess(null);
    const name = `${enquiryForm.firstName} ${enquiryForm.lastName}`.trim();
    if (
      !name ||
      !enquiryForm.phone.trim() ||
      !enquiryForm.email.trim() ||
      !enquiryForm.company.trim() ||
      !enquiryForm.message.trim()
    ) {
      setEnquiryError("Please fill all fields.");
      toast.error("Please fill all fields.");
      return;
    }
    setEnquirySubmitting(true);
    try {
      await createEnquiryLead({
        name,
        phone: enquiryForm.phone,
        email: enquiryForm.email,
        company: enquiryForm.company,
        message: enquiryForm.message,
      });
      setEnquirySuccess("Enquiry submitted! Our team will contact you soon.");
      toast.success("Enquiry submitted! Our team will contact you soon.");
      setEnquiryForm({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        company: "",
        message: "",
      });
    } catch {
      setEnquiryError("Failed to send enquiry. Please try again.");
      toast.error("Failed to send enquiry. Please try again.");
    }
    setEnquirySubmitting(false);
  };
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 to-green-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Sustainable Paper Reel
                <span className="text-green-600"> Manufacturing</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                High-quality paper reels for every need. Eco-friendly. Reliable.
                Trusted. Leading the industry with sustainable manufacturing
                practices.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/stock">
                  <Button
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg"
                  >
                    Check Available Stock
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50 px-8 py-4 text-lg"
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div className="relative">
              <img
                src={"/paperreel.png"}
                alt="Paper reels manufacturing facility"
                width={600}
                height={500}
                className="rounded-lg shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium">100% Eco-Friendly</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              About Parashwanath Enterprises
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Leading the industry in sustainable paper reel manufacturing with
              over 25 years of experience
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Our Mission & Values
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Parashwanath Enterprises is a leading manufacturer of
                sustainable paper reels, committed to providing high-quality
                products while minimizing environmental impact. Our mission is
                to deliver reliable, eco-friendly paper solutions that meet the
                diverse needs of our customers worldwide.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                We value sustainability, innovation, and customer satisfaction,
                ensuring our manufacturing processes adhere to the highest
                standards of quality and environmental responsibility. Our team
                of experts is dedicated to crafting paper reels that are both
                durable and environmentally conscious.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    25+
                  </div>
                  <div className="text-gray-600">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    500+
                  </div>
                  <div className="text-gray-600">Happy Clients</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img
                src={"/factorymanufactoring.png"}
                alt="Manufacturing facility"
                width={300}
                height={250}
                className="rounded-lg shadow-lg"
              />
              <img
                src={"/factoryqc.png"}
                alt="Quality control process"
                width={300}
                height={250}
                className="rounded-lg shadow-lg"
              />
              <img
                src={"/factoryteamcollab.png"}
                alt="Team collaboration"
                width={300}
                height={250}
                className="rounded-lg shadow-lg"
              />
              <img
                src={"/factoryecofriendly.png"}
                alt="Eco-friendly manufacturing"
                width={300}
                height={250}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features & Benefits */}
      <section className="py-20 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Parashwanath Enterprises?
            </h2>
            <p className="text-xl text-gray-600">
              We deliver excellence through our core values and industry-leading
              practices
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Premium Quality
                </h3>
                <p className="text-gray-600">
                  ISO certified manufacturing processes ensuring consistent,
                  high-quality paper reels that meet international standards.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Recycle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  100% Sustainable
                </h3>
                <p className="text-gray-600">
                  Eco-friendly materials and processes with zero waste
                  manufacturing, contributing to a greener future.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Truck className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Fast Delivery
                </h3>
                <p className="text-gray-600">
                  Efficient logistics network ensuring timely delivery across
                  the globe with real-time tracking.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Settings className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Custom Solutions
                </h3>
                <p className="text-gray-600">
                  Tailored paper reel specifications to meet your unique
                  requirements with flexible manufacturing options.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Products Preview */}
      <section id="products" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Product Range
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive selection of paper reels for various industrial
              applications
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 relative">
                <img
                  src={"/standardpaperreel.png"}
                  alt="Standard Paper Reel"
                  className="absolute inset-0 w-full h-full object-cover opacity-20"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="text-2xl font-bold mb-2">Standard Reels</h3>
                    <p className="text-green-100">60-120 GSM</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-gray-600 mb-4">
                  High-quality standard paper reels suitable for various
                  printing and packaging applications.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Available in multiple widths</li>
                  <li>• Consistent quality standards</li>
                  <li>• Fast production times</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 relative">
                <img
                  src={"/premiumpaperreel.png"}
                  alt="Premium Paper Reel"
                  className="object-cover opacity-20"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="text-2xl font-bold mb-2">Premium Reels</h3>
                    <p className="text-blue-100">120-250 GSM</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-gray-600 mb-4">
                  Premium grade paper reels for high-end printing and
                  specialized industrial applications.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Superior finish quality</li>
                  <li>• Enhanced durability</li>
                  <li>• Custom specifications</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gradient-to-br from-amber-400 to-orange-600 relative">
                <img
                  src={"/paperreams.png"}
                  alt="Eco-Friendly Paper Reel"
                  className="object-cover opacity-20"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="text-2xl font-bold mb-2">Paper Reams</h3>
                    <p className="text-orange-100">50-100 GSM</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-gray-600 mb-4">
                  High quality paper reams made from premium materials, perfect
                  for office use and businesses.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Premium quality for professional use</li>
                  <li>• Great printability</li>
                  <li>• Biodegradable packaging</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Link to="/stock">
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4"
              >
                View All Products & Stock
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get In Touch
            </h2>
            <p className="text-xl text-gray-600">
              Ready to discuss your paper reel requirements? Contact our expert
              team today.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Contact Information
              </h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <Phone className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Phone</h4>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                    <p className="text-gray-600">Mon-Fri 8AM-6PM EST</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <Mail className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
                    <p className="text-gray-600">
                      info@Parashwanath Enterprises.com
                    </p>
                    <p className="text-gray-600">
                      sales@Parashwanath Enterprises.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <MapPin className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Address
                    </h4>
                    <p className="text-gray-600">123 Industrial Avenue</p>
                    <p className="text-gray-600">
                      Manufacturing District, State 12345
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Quick Inquiry
                </h3>
                <form className="space-y-4" onSubmit={handleEnquirySubmit}>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={enquiryForm.firstName}
                      onChange={(e) =>
                        setEnquiryForm((f) => ({
                          ...f,
                          firstName: e.target.value,
                        }))
                      }
                      required
                      autoComplete="given-name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={enquiryForm.lastName}
                      onChange={(e) =>
                        setEnquiryForm((f) => ({
                          ...f,
                          lastName: e.target.value,
                        }))
                      }
                      required
                      autoComplete="family-name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={enquiryForm.email}
                    onChange={(e) =>
                      setEnquiryForm((f) => ({ ...f, email: e.target.value }))
                    }
                    required
                    autoComplete="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={enquiryForm.phone}
                    onChange={(e) =>
                      setEnquiryForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    required
                    autoComplete="tel"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={enquiryForm.company}
                    onChange={(e) =>
                      setEnquiryForm((f) => ({ ...f, company: e.target.value }))
                    }
                    required
                    autoComplete="organization"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <textarea
                    placeholder="Tell us about your requirements..."
                    rows={4}
                    value={enquiryForm.message}
                    onChange={(e) =>
                      setEnquiryForm((f) => ({ ...f, message: e.target.value }))
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  ></textarea>
                  {enquiryError && (
                    <div className="text-red-500 text-sm">{enquiryError}</div>
                  )}
                  {enquirySuccess && (
                    <div className="text-green-600 text-sm">
                      {enquirySuccess}
                    </div>
                  )}
                  <Button
                    type="submit"
                    disabled={enquirySubmitting}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                  >
                    {enquirySubmitting ? "Submitting..." : "Send Inquiry"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
