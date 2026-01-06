// src/components/ui/breadcrumb.jsx
import * as React from "react"

// --- MOCKING EXTERNAL IMPORTS ---
// In a real project, these would be in node_modules or lib/utils
const cn = (...classes) => classes.filter(Boolean).join(' ');
const Slot = ({ children, ...props }) => React.cloneElement(children, props); // Mock Radix Slot

const ChevronRight = (props) => (<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>);
const MoreHorizontal = (props) => (<svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 12h.01M12 12h.01M18 12h.01"></path></svg>);
// ---------------------------------


function Breadcrumb({
  ...props
}) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
}

function BreadcrumbList({
  className,
  ...props
}) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5",
        className,
        "text-gray-600" // Added style for visibility in mock environment
      )}
      {...props} />
  );
}

function BreadcrumbItem({
  className,
  ...props
}) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props} />
  );
}

function BreadcrumbLink({
  asChild,
  className,
  onClick, // Added onClick for handling internal navigation
  ...props
}) {
  // We use 'button' here instead of 'a' (default) because we are handling internal state navigation
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="breadcrumb-link"
      onClick={onClick}
      className={cn(
        "transition-colors text-blue-600 hover:text-blue-800 disabled:cursor-default",
        className
      )}
      {...props} />
  );
}

function BreadcrumbPage({
  className,
  ...props
}) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("font-semibold text-gray-900", className)} // Adjusted style
      {...props} />
  );
}

function BreadcrumbSeparator({
  children,
  className,
  ...props
}) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5 mx-1 text-gray-400", className)} // Added styles
      {...props}>
      {children ?? <ChevronRight className="h-4 w-4" />}
    </li>
  );
}

function BreadcrumbEllipsis({
  className,
  ...props
}) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}>
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More</span>
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}
