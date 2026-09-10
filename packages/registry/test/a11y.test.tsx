// Real accessibility coverage (not the doctor CLI's regex heuristics):
// renders a representative, interactive instance of every component added
// in this batch (plus a few pre-existing components as a baseline) and runs
// axe-core against the actual rendered DOM -- including portaled popover/
// dialog/drawer content opened via a real click, not just the closed
// trigger -- asserting zero violations. This catches WCAG gaps a regex can
// never see: missing accessible names, aria-* misuse, contrast, focus
// order, etc.
import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { useForm } from "react-hook-form";

expect.extend(toHaveNoViolations);

// These renders are isolated fragments, not full documents -- page-level
// landmark/heading/lang rules don't apply and would only produce noise.
const axeConfig = {
  rules: {
    region: { enabled: false },
    "landmark-one-main": { enabled: false },
    "page-has-heading-one": { enabled: false },
    "html-has-lang": { enabled: false },
    "document-title": { enabled: false },
    bypass: { enabled: false },
  },
};

async function expectNoViolations(node: Element | Document = document.body) {
  const results = await axe(node, axeConfig);
  expect(results).toHaveNoViolations();
}

// --- Baseline (pre-existing) components, for comparison -------------------

import { Button } from "../src/components/button/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../src/components/card/card";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "../src/components/dialog/dialog";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../src/components/accordion/accordion";

// --- New components ---------------------------------------------------------

import { Label } from "../src/components/label/label";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "../src/components/form/form";
import { Input } from "../src/components/input/input";
import { Calendar } from "../src/components/calendar/calendar";
import { DatePicker } from "../src/components/date-picker/date-picker";
import { DataTable } from "../src/components/data-table/data-table";
import { Drawer, DrawerTrigger, DrawerContent, DrawerTitle, DrawerDescription } from "../src/components/drawer/drawer";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuViewport,
} from "../src/components/navigation-menu/navigation-menu";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
} from "../src/components/menubar/menubar";
import { MultiSelect } from "../src/components/multi-select/multi-select";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "../src/components/carousel/carousel";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "../src/components/resizable/resizable";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../src/components/input-otp/input-otp";
import { Kbd } from "../src/components/kbd/kbd";
import { FileUpload } from "../src/components/file-upload/file-upload";
import { Stepper } from "../src/components/stepper/stepper";
import { Timeline } from "../src/components/timeline/timeline";

describe("axe accessibility -- baseline components", () => {
  it("Button has no violations", async () => {
    render(<Button>Save changes</Button>);
    await expectNoViolations();
  });

  it("Card has no violations", async () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Body</CardContent>
      </Card>,
    );
    await expectNoViolations();
  });

  it("Dialog has no violations once opened", async () => {
    render(
      <Dialog>
        <DialogTrigger>Open dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog title</DialogTitle>
          <DialogDescription>Dialog description</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    fireEvent.click(screen.getByText("Open dialog"));
    await screen.findByText("Dialog description");
    await expectNoViolations();
  });

  it("Accordion has no violations once expanded", async () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Section one</AccordionTrigger>
          <AccordionContent>Section one content</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    fireEvent.click(screen.getByText("Section one"));
    await expectNoViolations();
  });
});

describe("axe accessibility -- new components", () => {
  it("Label has no violations when paired with an input", async () => {
    render(
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" />
      </div>,
    );
    await expectNoViolations();
  });

  it("Form has no violations", async () => {
    function TestForm() {
      const form = useForm({ defaultValues: { email: "" } });
      return (
        <Form {...form}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormDescription>We'll never share your email.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
      );
    }
    render(<TestForm />);
    await expectNoViolations();
  });

  it("Calendar has no violations", async () => {
    render(<Calendar mode="single" />);
    await expectNoViolations();
  });

  it("DatePicker has no violations once opened", async () => {
    render(<DatePicker />);
    fireEvent.click(screen.getByRole("button"));
    await screen.findByRole("grid");
    await expectNoViolations();
  });

  it("DataTable has no violations", async () => {
    const columns = [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "age", header: "Age" },
    ];
    const data = [
      { name: "Ada Lovelace", age: 36 },
      { name: "Alan Turing", age: 41 },
    ];
    render(<DataTable columns={columns} data={data} filterColumn="name" />);
    await expectNoViolations();
  });

  it("Drawer has no violations once opened", async () => {
    render(
      <Drawer>
        <DrawerTrigger>Open drawer</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Drawer title</DrawerTitle>
          <DrawerDescription>Drawer description</DrawerDescription>
        </DrawerContent>
      </Drawer>,
    );
    fireEvent.click(screen.getByText("Open drawer"));
    await screen.findByText("Drawer description");
    await expectNoViolations();
  });

  it("NavigationMenu has no violations once a panel is opened", async () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="/widgets">Widgets</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuViewport />
      </NavigationMenu>,
    );
    fireEvent.click(screen.getByText("Products"));
    await screen.findAllByText("Widgets");
    await expectNoViolations();
  });

  it("Menubar has no violations once a menu is opened", async () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New file</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    // Menubar's trigger opens on pointerdown, not click (see
    // @radix-ui/react-menubar's MenubarTrigger) -- a plain fireEvent.click
    // never fires the pointerdown handler that actually opens the menu.
    fireEvent.pointerDown(screen.getByText("File"));
    await screen.findByText("New file");
    await expectNoViolations();
  });

  it("MultiSelect has no violations once opened", async () => {
    render(
      <MultiSelect
        options={[
          { value: "a", label: "Apple" },
          { value: "b", label: "Banana" },
        ]}
        value={["a"]}
      />,
    );
    fireEvent.click(screen.getByRole("combobox"));
    await screen.findByText("Banana");
    await expectNoViolations();
  });

  it("Carousel has no violations", async () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Slide 1</CarouselItem>
          <CarouselItem>Slide 2</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>,
    );
    await expectNoViolations();
  });

  it("Resizable panel group has no violations", async () => {
    render(
      <ResizablePanelGroup direction="horizontal" style={{ height: 200 }}>
        <ResizablePanel>Left panel</ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel>Right panel</ResizablePanel>
      </ResizablePanelGroup>,
    );
    await expectNoViolations();
  });

  it("InputOTP has no violations", async () => {
    render(
      <InputOTP maxLength={4} aria-label="One-time code">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
      </InputOTP>,
    );
    await expectNoViolations();
  });

  it("Kbd has no violations", async () => {
    render(<Kbd>Ctrl</Kbd>);
    await expectNoViolations();
  });

  it("FileUpload has no violations", async () => {
    render(<FileUpload value={[]} onValueChange={() => {}} />);
    await expectNoViolations();
  });

  it("Stepper has no violations", async () => {
    render(
      <Stepper
        currentStep={1}
        steps={[{ label: "Account" }, { label: "Profile" }, { label: "Confirm" }]}
      />,
    );
    await expectNoViolations();
  });

  it("Timeline has no violations", async () => {
    render(
      <Timeline
        items={[
          { title: "Order placed", timestamp: "9:00 AM" },
          { title: "Order shipped", timestamp: "2:00 PM" },
        ]}
      />,
    );
    await expectNoViolations();
  });
});
