"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";
import apiClient from "@/lib/apiClient";
import { useToast } from "@/components/ui/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PhotoshootPackage } from "@/types/order.dto";
import { CheckCircle2, XCircle } from "lucide-react";

export default function ReservationSection() {
  const { toast } = useToast();

  const [packages, setPackages] = useState<PhotoshootPackage[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [loading, setLoading] = useState(false);

  // Form data
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");

  // Validation state
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    phoneNumber: false,
  });

  const [valid, setValid] = useState({
    firstName: false,
    lastName: false,
    email: false,
    phoneNumber: false,
  });

  // Validation rules
  const validateField = (field: string, value: string) => {
    switch (field) {
      case "firstName":
      case "lastName":
        return value.trim().length > 1;
      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case "phoneNumber":
        return /^[0-9+\-() ]{7,20}$/.test(value);
      default:
        return false;
    }
  };

  // Run validation on change
  useEffect(() => {
    setValid({
      firstName: validateField("firstName", firstName),
      lastName: validateField("lastName", lastName),
      email: validateField("email", email),
      phoneNumber: validateField("phoneNumber", phoneNumber),
    });
  }, [firstName, lastName, email, phoneNumber]);

  /** Fetch available packages */
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await apiClient.get<{ packages: PhotoshootPackage[] }>(
          "/api/packages",
          { withCredentials: true }
        );
        setPackages(res.data.packages || []);
      } catch (err: any) {
        toast({
          title: "Failed to load packages",
          description: err?.response?.data?.message || "Try again later.",
          variant: "destructive",
        });
      }
    };
    fetchPackages();
  }, []);

  /** Submit handler */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent submission in production
    if (process.env.NEXT_PUBLIC_ENVIRONMENT === "production") {
      return;
    }

    if (
      !valid.firstName ||
      !valid.lastName ||
      !valid.email ||
      !valid.phoneNumber ||
      !selectedPackageId
    ) {
      toast({
        title: "Invalid fields",
        description: "Please correct all required fields before submitting.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await apiClient.post(
        "/api/reservations",
        {
          firstName,
          lastName,
          email,
          phoneNumber,
          packageId: selectedPackageId,
          shootDate: selectedDate ? selectedDate.toISOString() : undefined,
          customerMessage: message,
        },
        { withCredentials: true }
      );

      toast({
        title: "Reservation sent!",
        description: "Please check your email to confirm your booking.",
      });

      setFirstName("");
      setLastName("");
      setEmail("");
      setPhoneNumber("");
      setSelectedPackageId("");
      setSelectedDate(undefined);
      setMessage("");
      setTouched({
        firstName: false,
        lastName: false,
        email: false,
        phoneNumber: false,
      });
    } catch (err: any) {
      toast({
        title: "Error sending reservation",
        description: err?.response?.data?.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const ValidationIcon = ({ field }: { field: keyof typeof valid }) => {
    if (!touched[field]) return null;
    return valid[field] ? (
      <CheckCircle2 className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  return (
    <section
      id="reservation-section"
      className="py-20 px-4 sm:px-6 lg:px-8 w-full mx-auto"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-white/5 dark:bg-gray-900/50 backdrop-blur-md p-10 rounded-2xl shadow-lg relative overflow-hidden items-stretch"
      >
        {/* Contact Section */}
        <div className="flex flex-col justify-center items-center text-center space-y-6 p-6 h-full">
          <motion.h3
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-2xl font-bold mb-2"
          >
            Kontaktujte ma
          </motion.h3>

          <p className="text-foreground/80 max-w-sm">
            Máte akékoľvek otázky pred tým, ako si rezervujete termín?
            Kontaktujte ma na uvedenom čísle alebo napíšte správu cez email —
            odpoviem najrýchlejšie ako viem.
          </p>

          <div className="space-y-3 text-foreground/90">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="flex items-center gap-3 justify-center hover:drop-shadow-lg"
            >
              <Mail className="w-5 h-5 text-primary transition-all duration-300 hover:text-primary/80" />
              <a href="mailto:[ pripravuje sa ]" className="hover:underline">
                [ pripravuje sa ]
              </a>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="flex items-center gap-3 justify-center hover:drop-shadow-lg"
            >
              <Phone className="w-5 h-5 text-primary transition-all duration-300 hover:text-primary/80" />
              <a href="tel:+421900123456" className="hover:underline">
                [ pripravuje sa ]
              </a>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="flex items-center gap-3 justify-center hover:drop-shadow-lg"
            >
              <MapPin className="w-5 h-5 text-primary transition-all duration-300 hover:text-primary/80" />
              <span>Sabinov, Slovensko</span>
            </motion.div>
          </div>

          <p className="text-sm text-foreground/60 italic mt-4">
            “Fotografia je príbeh, ktorý sa ťazko opisuje slovami.”
          </p>
        </div>

        {/* Calendar */}
        <div className="flex flex-col justify-center items-center px-6 h-full">
          <h3 className="text-2xl font-bold mb-4 text-center">
            Vyberte si dátum fotenia
          </h3>
          <div className="relative w-full flex justify-center">
            <div style={{ minHeight: "360px" }}>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-xl border bg-white dark:bg-gray-800/90 shadow-xl"
                modifiers={{ today: new Date() }}
                modifiersStyles={{
                  today: {
                    border: "1px solid #3b82f6",
                    borderRadius: "50%",
                    color: "#3b82f6",
                  },
                  selected: {
                    backgroundColor: "#3b82f6",
                    color: "white",
                    borderRadius: "50%",
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Reservation Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col justify-center space-y-4 px-6 h-full md:col-span-2 lg:col-span-1"
        >
          <h3 className="text-2xl font-bold mb-4 text-center">
            Rezervácia termínu (dočasne nedostupné)
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <Input
                placeholder="Meno *"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                onBlur={() =>
                  setTouched((prev) => ({ ...prev, firstName: true }))
                }
                className={`${
                  touched.firstName && !valid.firstName ? "border-red-500" : ""
                }`}
              />
              <div className="absolute right-3 top-3">
                <ValidationIcon field="firstName" />
              </div>
            </div>

            <div className="relative">
              <Input
                placeholder="Priezvisko *"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                onBlur={() =>
                  setTouched((prev) => ({ ...prev, lastName: true }))
                }
                className={`${
                  touched.lastName && !valid.lastName ? "border-red-500" : ""
                }`}
              />
              <div className="absolute right-3 top-3">
                <ValidationIcon field="lastName" />
              </div>
            </div>
          </div>

          <div className="relative">
            <Input
              type="email"
              placeholder="Email *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              className={`${
                touched.email && !valid.email ? "border-red-500" : ""
              }`}
            />
            <div className="absolute right-3 top-3">
              <ValidationIcon field="email" />
            </div>
          </div>

          <div className="relative">
            <Input
              type="tel"
              placeholder="Telefónne číslo *"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              onBlur={() =>
                setTouched((prev) => ({ ...prev, phoneNumber: true }))
              }
              className={`${
                touched.phoneNumber && !valid.phoneNumber
                  ? "border-red-500"
                  : ""
              }`}
            />
            <div className="absolute right-3 top-3">
              <ValidationIcon field="phoneNumber" />
            </div>
          </div>

          <Input
            type="text"
            readOnly
            placeholder="Zvoľte dátum v kalendári"
            value={selectedDate ? selectedDate.toLocaleDateString("sk-SK") : ""}
            className="bg-white/90 dark:bg-gray-800/90 cursor-not-allowed"
          />

          <Select
            value={selectedPackageId}
            onValueChange={setSelectedPackageId}
          >
            <SelectTrigger className="bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100">
              <SelectValue placeholder="Select a Package *" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
              {packages.map((pkg) => (
                <SelectItem
                  className="hover:bg-gray-400"
                  key={pkg.id}
                  value={pkg.id.toString()}
                >
                  {pkg.displayName} — €{pkg.basePrice}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Textarea
            placeholder="Zanechajte správu"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button
            type="submit"
            disabled={
              process.env.NEXT_PUBLIC_ENVIRONMENT === "production" ||
              loading ||
              !valid.firstName ||
              !valid.lastName ||
              !valid.email ||
              !valid.phoneNumber ||
              !selectedPackageId
            }
            variant="outline"
            className={`w-full text-lg py-6 ${
              process.env.NEXT_PUBLIC_ENVIRONMENT === "production"
                ? "opacity-40 cursor-not-allowed"
                : "cursor-pointer"
            }`}
          >
            {process.env.NEXT_PUBLIC_ENVIRONMENT === "production"
              ? "Dočasne nedostupné"
              : loading
              ? "Posielam..."
              : "Odoslať požiadavku"}
          </Button>
        </form>
      </motion.div>
    </section>
  );
}
