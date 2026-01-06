import { cn } from "@/lib/utils";
import { Marquee } from "../ui/marquee";
import { FaQuoteLeft } from "react-icons/fa";

const reviews = [
  {
    name: "Anjali",
    role: "B.Sc. Computer Science",
    body: "This LMS has made my life so much easier. The interface is clean and intuitive, and I can find everything I need without any hassle.",
    img: "https://avatar.vercel.sh/anjali",
  },
  {
    name: "Rahul",
    role: "B.Sc. IT",
    body: "The content on this platform is top-notch. I feel like I'm getting a high-quality education and the courses are genuinely helping me grow my skills.",
    img: "https://avatar.vercel.sh/rahul",
  },
  {
    name: "Priya",
    role: "B.Sc. Data Science",
    body: "I was new to online learning, but this LMS made the transition seamless. The support team is incredibly responsive and helpful whenever I have a question.",
    img: "https://avatar.vercel.sh/priya",
  },
  {
    name: "Karan",
    role: "B.Sc. Computer Science",
    body: "I love the flexibility this platform offers. I can learn at my own pace and on my own schedule, which is perfect for my busy life.",
    img: "https://avatar.vercel.sh/karan",
  },
  {
    name: "Deepika",
    role: "B.Sc. IT",
    body: "The community features are fantastic. It's great to connect with other learners and share insights on the courses.",
    img: "https://avatar.vercel.sh/deepika",
  },
  {
    name: "Sanjay",
    role: "B.Sc. Data Science",
    body: "I appreciate the detailed progress tracking. It keeps me motivated and helps me see how far I've come in my learning journey.",
    img: "https://avatar.vercel.sh/sanjay",
  },
  {
    name: "Neha",
    role: "B.Sc. Computer Science",
    body: "The video lectures are high quality and easy to follow. I also really enjoy the interactive quizzes and assignments that reinforce the material.",
    img: "https://avatar.vercel.sh/neha",
  },
  {
    name: "Vikram",
    role: "B.Sc. IT",
    body: "I've tried other LMS systems before, but this one is the most user-friendly. I'm always able to find what I need quickly and efficiently.",
    img: "https://avatar.vercel.sh/vikram",
  },
  {
    name: "Ritika",
    role: "B.Sc. Data Science",
    body: "The course on data science was comprehensive and well-structured. The instructors broke down complex topics into easy-to-understand modules.",
    img: "https://avatar.vercel.sh/ritika",
  },
  {
    name: "Varun",
    role: "B.Sc. Computer Science",
    body: "This platform is an excellent investment in my career. The skills I've gained have already made a noticeable impact on my work.",
    img: "https://avatar.vercel.sh/varun",
  },
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

const ReviewCard = ({ img, name, role, body }) => {
  return (
    <figure
      className={cn(
        "relative h-full w-80 cursor-pointer overflow-hidden rounded-xl p-6 shadow-md transition-transform hover:scale-105",
        "bg-white/80 border border-gray-200 backdrop-blur-sm",
        "dark:bg-gray-800/80 dark:border-gray-700"
      )}
    >
      {/* Quote Icon */}
      <FaQuoteLeft className="text-blue-500 text-xl mb-3" />

      {/* Testimonial Text */}
      <blockquote className="text-gray-700 italic text-sm leading-relaxed dark:text-gray-300">
        {body}
      </blockquote>

      {/* Author */}
      <figcaption className="mt-4 flex items-center gap-3">
        <img
          className="rounded-full border border-gray-300"
          width="40"
          height="40"
          alt={name}
          src={img}
        />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {name}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {role}
          </span>
        </div>
      </figcaption>
    </figure>
  );
};

export function MarqueeDemo() {
  return (
    <div className="relative bg-[var(--background2)] dark:bg-[var(--secondary-background)] py-10 flex w-full flex-col items-center justify-center overflow-hidden">
      <Marquee pauseOnHover className="[--duration:50s]">
        {firstRow.map((review, index) => (
          <ReviewCard key={`${review.name}-${index}`} {...review} />
        ))}
      </Marquee>
      <Marquee reverse pauseOnHover className="[--duration:65s]">
        {secondRow.map((review, index) => (
          <ReviewCard key={`${review.name}-${index}`} {...review} />
        ))}
      </Marquee>

      {/* Gradient Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white dark:from-gray-950"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white dark:from-gray-950"></div>
    </div>
  );
}
