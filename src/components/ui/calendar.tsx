"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "./utils";
import { buttonVariants } from "./button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("rdp p-4", className)}
      classNames={{
        months: "rdp-months",
        month: "rdp-month",
        caption: "rdp-caption",
        caption_label: "rdp-caption_label",
        nav: "rdp-nav",
        nav_button: "rdp-nav_button",
        nav_button_previous: "rdp-nav_button_previous",
        nav_button_next: "rdp-nav_button_next",
        table: "rdp-table",
        head_row: "rdp-head_row",
        head_cell: "rdp-head_cell",
        tbody: "rdp-tbody",
        row: "rdp-row",
        cell: "rdp-cell",
        day: "rdp-button",
        day_range_start: "rdp-day_range_start",
        day_range_end: "rdp-day_range_end",
        day_selected: "rdp-day_selected",
        day_today: "rdp-day_today",
        day_outside: "rdp-day_outside", 
        day_disabled: "rdp-day_disabled",
        day_range_middle: "rdp-day_range_middle",
        day_hidden: "rdp-day_hidden",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("w-4 h-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("w-4 h-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  );
}

export { Calendar };
