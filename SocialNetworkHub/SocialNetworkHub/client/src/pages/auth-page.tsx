import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Brush, Video, Music, Trophy } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

const registerSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [_, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const onLogin = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  const onRegister = (data: RegisterFormValues) => {
    // Remove confirmPassword as it's not in the API schema
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="text-center mb-4">
              <div className="text-2xl font-bold flex items-center justify-center">
                <span className="text-primary">Dev</span>Challenge
                <span className="ml-2 bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text text-sm font-bold px-2 py-1 rounded-md border border-muted">BETA</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              {tab === "login" ? "Sign in to your account" : "Create a new account"}
            </CardTitle>
            <CardDescription>
              {tab === "login" 
                ? "Enter your credentials to access your account" 
                : "Fill in the form below to create your DevChallenge account"}
            </CardDescription>
          </CardHeader>
          <Tabs value={tab} onValueChange={(v: string) => setTab(v as "login" | "register")}>
            <TabsList className="grid grid-cols-2 mb-4 mx-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLogin)}>
                  <CardContent className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Signing in..." : "Sign in"}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegister)}>
                  <CardContent className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Choose a username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter your email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Create a password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Confirm your password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating account..." : "Create account"}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
      
      <div className="hidden md:flex w-1/2 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 p-12 items-center justify-center">
        <div className="max-w-lg">
          <h1 className="text-4xl font-bold mb-6">
            <span className="text-primary">Dev</span>Challenge
          </h1>
          <p className="text-xl mb-8">Join the ultimate platform for creative competitions and showcase your talents.</p>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-card p-2 rounded-full mr-4">
                <Code className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Code Battles</h3>
                <p className="text-muted-foreground">Compete in real-time coding challenges against other developers.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-card p-2 rounded-full mr-4">
                <Brush className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Design Showdowns</h3>
                <p className="text-muted-foreground">Create beautiful designs and UI/UX solutions in time-limited competitions.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-card p-2 rounded-full mr-4">
                <Video className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Video & Audio Contests</h3>
                <p className="text-muted-foreground">Showcase your multimedia skills in creative video and audio challenges.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-card p-2 rounded-full mr-4">
                <Trophy className="h-6 w-6 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Climb the Rankings</h3>
                <p className="text-muted-foreground">Build your reputation, improve your ELO, and become a recognized creator.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
