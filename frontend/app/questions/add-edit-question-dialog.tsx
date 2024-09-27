import { forwardRef, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Question } from "./columns";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { categories, complexities } from "./data";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AddEditQuestionDialogProps {
  row: Question | null;
  setData?: React.Dispatch<React.SetStateAction<Question[]>>;
  handleClose: () => void;
}

function AddEditQuestionDialog(
  props: AddEditQuestionDialogProps,
  ref: React.Ref<HTMLDivElement>
) {
  const { row, setData, handleClose } = props;
  const [complexityValue, setComplexityValue] = useState(
    row?.complexity || "easy"
  );

  // Error state for visual validation feedback
  const [errors, setErrors] = useState({
    title: false,
    description: false,
    complexity: false,
  });

  // User input value
  const [newQuestion, setNewQuestion] = useState({
    id: row?.id || undefined,
    title: row?.title || "",
    summary: row?.summary || "",
    description: row?.description || "",
    complexity: row?.complexity || "easy",
    categories: row?.categories || [],
    link: row?.link || "",
  });

  const handleInputChange = (field: string, value: string | string[]) => {
    setNewQuestion((prevState) => ({
      ...prevState, 
      [field]: value, // Dynamically update the field that changed based on the input name
    }));
  };

  const validateFields = () => {
    const newErrors = {
      title: !newQuestion.title, // Check if title is empty
      description: !newQuestion.description, // Check if description is empty
      complexity: !newQuestion.complexity, // Check if complexity is empty
      categories: !(newQuestion.categories?.length || 0), // Check if categories are empty
    };
    setErrors(newErrors);
    // Return true if all required fields are valid
    return !Object.values(newErrors).includes(true);
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  async function createQuestion() {
    // validate required fields
    if (validateFields()) {
      try {
        const response = await fetch(`${apiUrl}/questions/new`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newQuestion),
        });

        if (!response.ok) {
          throw new Error("Failed to insert question into backend");
        }

        const createdQuestion = await response.json();

        if (setData) {
          setData((prev: Question[]) => [...prev, createdQuestion]); // Update the list
        }

        // Close the dialog after succesful creation
        handleClose();
      } catch (error) {
        alert(
          "An error occurred while creating the question. Please try again."
        );
        console.error("Error creating question:", error);
      }
    }
  }

  async function updateQuestion() {
    try {
      const response = await fetch(
        `${apiUrl}/questions/update/:${row?.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newQuestion),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update the question to backend");
      }

      if (setData && row) {
        setData((prev: Question[]) =>
          prev.map((q) =>
            q.id === row.id ? { ...newQuestion, id: row.id } : q
          )
        ); // Update the list
      }

      // Close the dialog after succesful creation
      handleClose();
    } catch (error) {
      alert(
        "An error occurred while editing the question. Please try again."
      );
      console.error("Error updating question:", error);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="hidden" ref={ref} />
      </DialogTrigger>
      <DialogContent
        className="laptop:max-w-[75vw] bg-white text-black font-sans rounded-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="items-start">
          <DialogTitle className="font-serif font-normal tracking-tight text-3xl">
            {row?.id ? `Edit question ${row.id}` : "Add new question"}
          </DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <div className="flex flex-col w-full gap-4 py-4 justify-start">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="title" className="">
              Title
            </Label>
            <Input
              id="title"
              defaultValue={row?.title ?? ""}
              placeholder="Question title"
              onChange={(e) => handleInputChange("title", e.target.value)}
            />
            {errors.title && (
              <div className="text-red-500">Title is required</div>
            )}
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="summary" className="">
              Summary
            </Label>
            <Input
              id="summary"
              defaultValue={row?.summary ?? ""}
              placeholder="One-line summary"
              onChange={(e) => handleInputChange("summary", e.target.value)}
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="description" className="">
              Description
            </Label>
            <Textarea
              id="description"
              defaultValue={row?.description ?? ""}
              placeholder="Question description and instructions"
              className="max-h-[50vh]"
              onChange={(e) => handleInputChange("description", e.target.value)}
            />
            {errors.description && (
              <div className="text-red-500">Description is required</div>
            )}
          </div>
          <div className="flex flex-row w-full items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="cursor-default">
                  <Label htmlFor="complexity" className="cursor-help">
                    Complexity
                  </Label>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="max-w-[200px] flex-wrap">
                    Difficulty level of the question, choose one
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <ToggleGroup
              type="single"
              variant="complexities"
              size="xs"
              value={complexityValue}
              onValueChange={(value) => {
                if (value) {
                  setComplexityValue(value);
                  handleInputChange("complexity", value);
                }
              }}
              className="bg-brand-50 p-1 rounded-lg"
            >
              {complexities.map((complexity) => (
                <ToggleGroupItem
                  key={complexity.value}
                  value={complexity.value}
                >
                  {complexity.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            {errors.complexity && (
              <div className="text-red-500 text-sm">
                Please select at least one complexity.
              </div>
            )}
          </div>
          <div className="flex flex-row w-full items-center gap-4">
            <div className="">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="cursor-default">
                    <Label htmlFor="categories" className="cursor-help">
                      Categories
                    </Label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="max-w-[175px] flex-wrap">
                      Question topic(s), choose at least one option
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <ToggleGroup
              type="multiple"
              variant="categories"
              size="xs"
              defaultValue={row?.categories}
              onValueChange={(value) => {
                if (value) {
                  handleInputChange("categories", value);
                }
              }}
              className="bg-brand-50 p-1 rounded-lg flex-wrap justify-start"
            >
              {categories.map((category) => (
                <ToggleGroupItem
                  key={category.value}
                  value={category.value}
                  className="flex-shrink-0"
                >
                  {category.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="link" className="">
              Link
            </Label>
            <Input
              id="link"
              defaultValue={row?.link ?? ""}
              placeholder="Link to original question"
              onChange={(e) => handleInputChange("link", e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="flex">
          <Button
            type="submit"
            className="rounded-lg bg-brand-700 hover:bg-brand-600"
            onClick={row ? updateQuestion : createQuestion}
          >
            {row ? "Save changes" : "Done"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const ForwardedAddEditQuestionDialog = forwardRef(AddEditQuestionDialog);
ForwardedAddEditQuestionDialog.displayName = "AddEditQuestionDialog";

export default ForwardedAddEditQuestionDialog;
