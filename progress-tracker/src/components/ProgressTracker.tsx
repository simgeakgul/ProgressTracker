import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "../components/ui/sheet";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import {
  addDays,
  startOfWeek,
  startOfMonth,
  format,
  eachDayOfInterval,
} from "date-fns";

/**
 * Types
 */
interface Task {
  id: string;
  date: string; // ISO Date (yyyy-mm-dd)
  subject: string;
  title: string;
  resource: string;
  genre: string;
  expectedTime: number; // minutes
  notes: string;
  status: "pending" | "completed";
}

/**
 * Sample tasks – replace with API backend later
 */

const sampleTasks: Task[] = [
  {
    id: "t1",
    date: format(new Date(), "yyyy-MM-dd"),
    subject: "Mathematics",
    title: "Algebra Worksheet 5",
    resource: "Worksheet PDF",
    genre: "Practice",
    expectedTime: 40,
    notes: "Focus on factoring quadratics.",
    status: "pending",
  },
  {
    id: "t2",
    date: format(addDays(new Date(), 1), "yyyy-MM-dd"),
    subject: "History",
    title: "Read Chapter 3 – WWI",
    resource: "Textbook",
    genre: "Reading",
    expectedTime: 30,
    notes: "Take summary notes.",
    status: "pending",
  },
];

/**
 * Helper to get array of days for week / month
 */
const getDaysForView = (
  view: "daily" | "weekly" | "monthly",
  reference: Date,
): Date[] => {
  switch (view) {
    case "daily":
      return [reference];
    case "weekly": {
      const start = startOfWeek(reference, { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end: addDays(start, 6) });
    }
    case "monthly": {
      const start = startOfMonth(reference);
      const end = addDays(startOfMonth(addDays(reference, 32)), -1);
      return eachDayOfInterval({ start, end });
    }
  }
};

/**
 * Hook to detect if viewport is mobile (<640px)
 */
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
};

/**
 * ProgressTracker root component
 */
export default function ProgressTracker() {
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<"daily" | "weekly" | "monthly">(
    "weekly",
  );
  const [referenceDate] = useState<Date>(new Date());

  const isMobile = useIsMobile();
  const days = getDaysForView(viewMode, referenceDate);

  const handleComplete = (
    id: string,
    stats: {
      completionTime: number;
      numQuestions: number;
      correct: number;
      wrong: number;
      empty: number;
      extraNotes: string;
    },
  ) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: "completed",
              notes: `${t.notes}\nFinished in ${stats.completionTime} min.`,
            }
          : t,
      ),
    );
    setSelectedTask(null);
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* View Toggle */}
      <div className="flex gap-2 justify-center sm:justify-start flex-wrap">
        {(["daily", "weekly", "monthly"] as const).map((m) => (
          <Button
            key={m}
            variant={viewMode === m ? "default" : "secondary"}
            onClick={() => setViewMode(m)}
            size={isMobile ? "sm" : "default"}
          >
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </Button>
        ))}
      </div>

      {/* Calendar Grid */}
      <div
        className={
          viewMode === "daily"
            ? "flex flex-col items-center space-y-4"
            : "grid gap-3 " +
              (viewMode === "weekly"
                ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7"
                : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7")
        }
      >
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const dayTasks = tasks.filter((t) => t.date === dateStr);
          return (
            <Card
              key={dateStr}
              className="min-h-[120px] w-full"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm sm:text-base font-medium flex justify-between items-center">
                  <span>{format(day, "dd MMM")}</span>
                  <span className="text-xs text-muted-foreground">
                    {dayTasks.length} tasks
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {dayTasks.map((task) => (
                  <Sheet
                    key={task.id}
                    open={selectedTask?.id === task.id}
                    onOpenChange={(open) => {
                      if (open) {
                        setSelectedTask(task);
                      } else {
                        setSelectedTask(null);
                      }
                    }}
                  >
                    <SheetTrigger asChild>
                      <Button
                        size="sm"
                        variant={
                          task.status === "completed" ? "secondary" : "default"
                        }
                        className="w-full justify-start truncate"
                      >
                        {task.title}
                      </Button>
                    </SheetTrigger>
                    {selectedTask?.id === task.id && (
                      <SheetContent
                        side={isMobile ? "bottom" : "right"}
                        className="w-full sm:w-[400px] max-h-[90vh] overflow-y-auto"
                      >
                        <div className="space-y-4 p-2 sm:p-0">
                          <h2 className="text-lg sm:text-xl font-semibold">
                            {task.title}
                          </h2>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <Label className="col-span-1">Status</Label>
                            <span className="col-span-2">{task.status}</span>
                            <Label className="col-span-1">Subject</Label>
                            <span className="col-span-2">{task.subject}</span>
                            <Label className="col-span-1">Resource</Label>
                            <span className="col-span-2">{task.resource}</span>
                            <Label className="col-span-1">Genre</Label>
                            <span className="col-span-2">{task.genre}</span>
                            <Label className="col-span-1">Expected</Label>
                            <span className="col-span-2">{task.expectedTime} min</span>
                            <Label className="col-span-1">Notes</Label>
                            <span className="col-span-2 whitespace-pre-wrap">
                              {task.notes}
                            </span>
                          </div>

                          {task.status === "pending" ? (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" className="w-full sm:w-auto">
                                  Mark as Complete
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="space-y-4 max-w-lg">
                                <DialogHeader>
                                  <DialogTitle>Completion Details</DialogTitle>
                                </DialogHeader>
                                <form
                                  className="grid gap-4"
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    const form = e.target as HTMLFormElement;
                                    const data = new FormData(form);
                                    handleComplete(task.id, {
                                      completionTime: Number(data.get("completionTime")),
                                      numQuestions: Number(data.get("numQuestions")),
                                      correct: Number(data.get("correct")),
                                      wrong: Number(data.get("wrong")),
                                      empty: Number(data.get("empty")),
                                      extraNotes: String(data.get("extraNotes")),
                                    });
                                  }}
                                >
                                  <div className="grid grid-cols-2 gap-2">
                                    <Label htmlFor="completionTime">
                                      Completion Time (min)
                                    </Label>
                                    <Input
                                      name="completionTime"
                                      type="number"
                                      required
                                      min={1}
                                    />
                                    <Label htmlFor="numQuestions"># Questions</Label>
                                    <Input
                                      name="numQuestions"
                                      type="number"
                                      required
                                      min={1}
                                    />
                                    <Label htmlFor="correct">Correct</Label>
                                    <Input
                                      name="correct"
                                      type="number"
                                      required
                                      min={0}
                                    />
                                    <Label htmlFor="wrong">Wrong</Label>
                                    <Input
                                      name="wrong"
                                      type="number"
                                      required
                                      min={0}
                                    />
                                    <Label htmlFor="empty">Empty</Label>
                                    <Input
                                      name="empty"
                                      type="number"
                                      required
                                      min={0}
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="extraNotes">Additional Notes</Label>
                                    <Input name="extraNotes" type="text" />
                                  </div>
                                  <Button type="submit" className="w-full mt-4">
                                    Save & Complete
                                  </Button>
                                </form>
                              </DialogContent>
                            </Dialog>
                          ) : (
                            <p className="text-green-600 font-medium">Completed</p>
                          )}
                        </div>
                      </SheetContent>
                    )}
                  </Sheet>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
