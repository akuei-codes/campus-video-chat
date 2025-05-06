
import React from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/lib/supabase";

const features = [
  {
    title: "Video Chat with Ivy League Students",
    description: "Connect face-to-face with students from all Ivy League universities in real-time.",
    icon: "🎥",
    link: "/match",
  },
  {
    title: "Build Your Network",
    description: "Connect with other students, create meaningful relationships, and expand your network.",
    icon: "🔗",
    link: "/network",
  },
  {
    title: "Safe & Verified",
    description: "All members are verified Ivy League students for a safe and relevant experience.",
    icon: "✓",
    link: "/profile",
  },
];

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
      const userData = await getCurrentUser();
      setUser(userData);
      setLoading(false);
    };
    
    checkUser();
  }, []);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-700 to-blue-700 bg-clip-text text-transparent animate-fade-in">
            Connect with Ivy League Students
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mb-10 animate-fade-in">
            Join video conversations with students from all Ivy League universities. 
            Build your network with authentic student connections.
          </p>
          
          <Alert variant="default" className="mb-8 bg-ivy/10 border-ivy text-foreground">
            <AlertDescription>
              IvyMatch helps you connect with students across all Ivy League universities through video chat!
            </AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            {user ? (
              <Button className="bg-ivy hover:bg-ivy-dark" size="lg" onClick={() => navigate("/match")}>
                Start Matching
              </Button>
            ) : (
              <Button className="bg-ivy hover:bg-ivy-dark" size="lg" onClick={() => navigate("/login")}>
                Join Now
              </Button>
            )}
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
            {features.map((feature, index) => (
              <Link to={user ? feature.link : "/login"} key={index} className="block">
                <Card className="hover:shadow-lg transition-all hover:-translate-y-1 h-full glass border-0">
                  <CardContent className="p-6 text-center flex flex-col items-center space-y-4 h-full">
                    <div className="text-4xl mb-2">{feature.icon}</div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
