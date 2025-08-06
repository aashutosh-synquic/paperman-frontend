"use client";
import { useTranslation } from "react-i18next";

export default function DashboardPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("Dashboard")}</h1>
        <p className="text-muted-foreground">
          {t(
            "Welcome to your admin dashboard. Here's an overview of your business."
          )}
        </p>
      </div>
    </div>
  );
}
