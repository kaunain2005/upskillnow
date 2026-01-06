import {
  ScrollVelocityContainer,
  ScrollVelocityRow,
} from "@/components/ui/scroll-based-velocity"

export function ScrollTextView({text1, text2}) {
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden border-y border-neutral-950 dark:border-gray-100 bg-gray-50 dark:bg-neutral-950 py-5">
      <ScrollVelocityContainer className="text-xl dark:text-gray-100 font-bold tracking-[-0.02em] md:text-3xl md:leading-[5rem]">
        <ScrollVelocityRow baseVelocity={2} direction={1}>
          {text1}
        </ScrollVelocityRow>
        <ScrollVelocityRow baseVelocity={5} direction={-1}>
          {text2}
        </ScrollVelocityRow>
      </ScrollVelocityContainer>
      <div className="from-background pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r"></div>
      <div className="from-background pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l"></div>
    </div>
  )
}
