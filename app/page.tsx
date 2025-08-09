import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import { Play, Edit, Zap, Clock, Star, Users, Sparkles, Check, ChevronDown } from "lucide-react"

export default function HomePage() {
  const videoTypes = [
    {
      title: "Real Story Videos",
      description: "Create engaging narrative content with AI-powered storytelling",
      image: "/placeholder.svg?height=200&width=300&text=Real+Story+Videos",
      badge: "Popular",
    },
    {
      title: "Tech Review Clips",
      description: "Generate professional product review videos instantly",
      image: "/placeholder.svg?height=200&width=300&text=Tech+Review+Clips",
      badge: "Trending",
    },
    {
      title: "Cooking AI Voiceovers",
      description: "Add perfect voiceovers to your cooking demonstrations",
      image: "/placeholder.svg?height=200&width=300&text=Cooking+AI+Voiceovers",
      badge: "New",
    },
    {
      title: "Generate Story Videos",
      description: "Transform text into compelling visual stories",
      image: "/placeholder.svg?height=200&width=300&text=Generate+Story+Videos",
      badge: "Hot",
    },
  ]

  const showcaseVideos = [
    "/placeholder.svg?height=250&width=200&text=Video+1",
    "/placeholder.svg?height=250&width=200&text=Video+2",
    "/placeholder.svg?height=250&width=200&text=Video+3",
    "/placeholder.svg?height=250&width=200&text=Video+4",
    "/placeholder.svg?height=250&width=200&text=Video+5",
    "/placeholder.svg?height=250&width=200&text=Video+6",
  ]

  const testimonials = [
    { name: "Sarah M.", avatar: "/placeholder.svg?height=40&width=40&text=SM", rating: 5 },
    { name: "Mike R.", avatar: "/placeholder.svg?height=40&width=40&text=MR", rating: 5 },
    { name: "Lisa K.", avatar: "/placeholder.svg?height=40&width=40&text=LK", rating: 5 },
    { name: "John D.", avatar: "/placeholder.svg?height=40&width=40&text=JD", rating: 5 },
    { name: "Emma W.", avatar: "/placeholder.svg?height=40&width=40&text=EW", rating: 5 },
  ]

  const features = [
    {
      icon: <Edit className="w-6 h-6" />,
      title: "Smart AI",
      description: "Advanced AI algorithms that understand context and create engaging content automatically",
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Premium FX",
      description: "Professional effects and transitions that make your videos stand out from the crowd",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Speed AI",
      description: "Generate high-quality videos in seconds, not hours. Perfect for content creators on the go",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Team AI",
      description: "Collaborate with your team and share projects seamlessly across all devices",
    },
  ]

  const steps = [
    {
      number: "01",
      title: "Write",
      description: "Describe your video idea or paste your script. Our AI understands context and tone.",
      details: ["Natural language processing", "Script optimization", "Content suggestions"],
    },
    {
      number: "02",
      title: "Create",
      description: "Watch as AI generates your video with perfect timing, effects, and transitions.",
      details: ["AI video generation", "Smart scene transitions", "Auto-sync audio"],
    },
    {
      number: "03",
      title: "Upload",
      description: "Export in any format and share directly to your favorite social platforms.",
      details: ["Multiple export formats", "Direct social sharing", "HD quality output"],
    },
  ]

  const faqs = [
    {
      question: "How does Mikael AI work?",
      answer:
        "Our AI analyzes your input and generates professional videos using advanced machine learning algorithms.",
    },
    {
      question: "Can I customize my videos?",
      answer: "Yes! You have full control over templates, styles, music, and effects to match your brand.",
    },
    {
      question: "Do you have a free trial?",
      answer: "Start with our free plan and upgrade when you're ready for more features.",
    },
    {
      question: "How long do videos take to generate?",
      answer: "Most videos are generated in under 30 seconds, depending on length and complexity.",
    },
    {
      question: "What types of videos can I create?",
      answer: "Create any type of video - from social media content to educational videos and marketing materials.",
    },
    {
      question: "Why use Mikael instead of other AI tools?",
      answer:
        "We offer the fastest generation times, highest quality output, and most intuitive interface in the market.",
    },
    {
      question: "Can I add custom voiceovers?",
      answer: "Yes! Upload your own audio or use our AI voice generation with multiple language options.",
    },
    {
      question: "I have more questions?",
      answer: "Contact our support team 24/7 through chat, email, or phone. We're here to help!",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold text-white">Mikael AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-gray-300 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-gray-300 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="#help" className="text-gray-300 hover:text-white transition-colors">
              Help
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton>
                <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-black font-semibold">
                  Try Mikael AI
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-black font-semibold">
                  Dashboard
                </Button>
              </Link>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10",
                  },
                }}
              />
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
            Create Viral Videos
            <br />
            <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
              With AI In Seconds
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Turn any idea into engaging video content. Our AI handles the heavy lifting while you focus on creativity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <SignedOut>
              <SignUpButton>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-black text-lg px-8 py-6 font-semibold"
                >
                  Try Mikael AI
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-black text-lg px-8 py-6 font-semibold"
                >
                  Go to Dashboard
                </Button>
              </Link>
            </SignedIn>
          </div>

          {/* Video Types Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {videoTypes.map((type, index) => (
              <Card
                key={index}
                className="bg-gray-900/50 border-gray-800 hover:border-orange-500/50 transition-all duration-300 group"
              >
                <CardHeader className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={type.image || "/placeholder.svg"}
                      alt={type.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-black">
                      {type.badge}
                    </Badge>
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                    <Button
                      size="sm"
                      className="absolute bottom-3 right-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-white text-lg mb-2">{type.title}</CardTitle>
                  <CardDescription className="text-gray-400 text-sm">{type.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900/50 to-black/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Millions of clips have been generated with Mikael AI
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
            {showcaseVideos.map((video, index) => (
              <div key={index} className="relative group cursor-pointer">
                <img
                  src={video || "/placeholder.svg"}
                  alt={`Generated video ${index + 1}`}
                  className="w-full h-64 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300 rounded-lg" />
                <Button
                  size="sm"
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <Play className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-4 mb-4">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="flex items-center gap-2">
                  <img
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full border-2 border-orange-500"
                  />
                </div>
              ))}
            </div>
            <p className="text-gray-300 mb-4">Join over 1M+ creators who trust Mikael AI</p>
            <div className="flex justify-center gap-1 mb-8">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
              ))}
            </div>
          </div>

          <div className="text-center">
            <SignedOut>
              <SignUpButton>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-black text-lg px-8 py-6 font-semibold"
                >
                  Try Mikael AI
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-black text-lg px-8 py-6 font-semibold"
                >
                  Go to Dashboard
                </Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20" id="features">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gray-900/30 border-gray-800 text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-white text-lg mb-2">{feature.title}</CardTitle>
                  <CardDescription className="text-gray-400">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900/50 to-black/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Let AI do all the heavy lifting</h2>
            <p className="text-xl text-gray-300">3 simple steps to viral content</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center text-black font-bold text-lg">
                      {step.number}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-gray-300 mb-4">{step.description}</p>
                    <ul className="space-y-2">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-center gap-2 text-gray-400">
                          <Check className="w-4 h-4 text-green-500" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative">
              <div className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-2xl p-8">
                <img
                  src="/placeholder.svg?height=500&width=400&text=AI+Video+Generation+Interface"
                  alt="AI Video Generation Interface"
                  className="w-full rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="text-center mt-16">
            <SignedOut>
              <SignUpButton>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-black text-lg px-8 py-6 font-semibold"
                >
                  Try Mikael AI
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-black text-lg px-8 py-6 font-semibold"
                >
                  Go to Dashboard
                </Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* Mobile Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">On the go generating</h2>
          <p className="text-xl text-gray-300 mb-12">Create anywhere, anytime</p>

          <div className="max-w-md mx-auto mb-12">
            <img
              src="/placeholder.svg?height=600&width=300&text=Mobile+App+Interface"
              alt="Mobile App Interface"
              className="w-full rounded-3xl shadow-2xl"
            />
          </div>

          <SignedOut>
            <SignUpButton>
              <Button
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-black text-lg px-8 py-6 font-semibold"
              >
                Try Mikael AI
              </Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-black text-lg px-8 py-6 font-semibold"
              >
                Go to Dashboard
              </Button>
            </Link>
          </SignedIn>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900/50 to-black/50" id="help">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-300">Everything you need to know about Mikael AI</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="bg-gray-900/30 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center cursor-pointer">
                    <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-gray-400 mt-4">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-bold">Mikael AI</span>
            </div>
            <div className="text-gray-400">© 2024 Mikael Software. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
