import {
  forwardRef,
  useEffect,
  useState,
} from "react";
import { z } from "zod";
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
  reset: boolean;
  setReset: (reset: boolean) => void;
}

function AddEditQuestionDialog(
  props: AddEditQuestionDialogProps,
  ref: React.Ref<HTMLDivElement>
) {
  const { row, setData, handleClose, reset, setReset } = props;
  const [complexityValue, setComplexityValue] = useState(
    row?.complexity || "easy"
  );

  // Error state for visual validation feedback
  const [errors, setErrors] = useState({
    title: false,
    description: false,
    complexity: false,
    categories: false,
    link: false,
  });

  const resetError = () => {
    const newErrors = {
      title: false,
      description: false,
      complexity: false,
      categories: false,
      link: false,
    };
    setErrors(newErrors);
  };

  useEffect(() => {
    if (reset) {
      resetError();
      setReset(false);
    }
  }, [reset, setReset]);
  
  // User input value
  const [newQuestion, setNewQuestion] = useState({
    id: row?.id || undefined,
    title: row?.title || "",
    description: row?.description || "",
    complexity: row?.complexity
      ? capitalizeFirstLetter(row?.complexity)
      : "Easy",
    categories: row?.categories || [],
    link: row?.link || "",
  });

  const handleInputChange = (field: string, value: string | string[]) => {
    setNewQuestion((prevState) => ({
      ...prevState,
      [field]: value, // Dynamically update the field that changed based on the input name
    }));
  };

  function capitalizeFirstLetter(word: string) {
    if (!word) return word; // Check if the word is empty or undefined
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  const validateFields = () => {
    const urlSchema = z
      .string()
      .url("Invalid URL format")
      .nonempty("URL is required");
    const newErrors = {
      title: !newQuestion.title, // Check if title is empty
      description: !newQuestion.description, // Check if description is empty
      complexity: !newQuestion.complexity, // Check if complexity is empty
      categories: !(newQuestion.categories?.length || 0), // Check if categories are empty
      link: urlSchema.safeParse(newQuestion.link).success === false, // Check if url is valid
    };
    setErrors(newErrors);
    // console.log("new error: ", newErrors);
    // Return true if all required fields are valid
    return !Object.values(newErrors).includes(true);
  };

  const apiUrl = process.env.NEXT_PUBLIC_QUESTION_API_BASE_URL;
  async function createQuestion() {
    // validate required fields
    if (validateFields()) {
      try {
        const endpoint = row?.id ? `update/${row?.id}` : "add";
        const method = row?.id ? "PUT" : "POST";
        const response = await fetch(`${apiUrl}/${endpoint}`, {
          method: method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...(row?.id ? { id: row.id } : {}),
            title: newQuestion.title,
            description: newQuestion.description,
            category: newQuestion.categories,
            complexity: newQuestion.complexity,
            link: newQuestion.link,
          }),
        });

        if (!response.ok) {
            console.log("error response from backend: ", response)

            const errorResponse = await response.json(); // Get the error details from the response
            const errorCode = errorResponse.errorCode;
            if (errorCode == "DUPLICATE_TITLE") {
              console.log("error")
              alert(`Error: Question "${newQuestion.title}" already exists`);  
            } else {
              const errorMessages = errorResponse.errors 
                      ? errorResponse.errors.join(", ") 
                      : errorResponse.message || "An unexpected error occurred.";

              alert(`Error: ${errorMessages}`);
            }
            return;
        }
        const responseText = await response.text();

        let questionId = row?.id;
        if (!row?.id) {
          // Use a regular expression to extract the ID from the response text
          const idMatch = responseText.match(/Question ID (\d+) added/);
          questionId = idMatch ? parseInt(idMatch[1], 10) : undefined; // Extract and parse the ID
        }

        if (questionId !== undefined) {
          const createdQuestion = {
            ...newQuestion, // Spread the existing question properties
            id: questionId, // Assign the new ID
          };

          // Update the question list
          if (setData) {
            if (!row?.id) {
              setData((prev: Question[]) => [...prev, createdQuestion]); // insert new question
            } else {
              setData(
                (prev: Question[]) =>
                  prev.map((q) => (q.id === row.id ? createdQuestion : q)) // update new question
              );
            }
          }
        } else {
          throw new Error(`Unexpected response format: ${responseText}`);
        }

        // Close the dialog after succesful creation
        handleClose();
      } catch (error) {
        alert(
          `An error occurred while ${row?.id ? "updating" : "creating"} the question. Please try again.`
        );
        console.error(
          `Error ${row?.id ? "updating" : "creating"} question:`,
          error
        );
      }
    }
  }

  // async function updateQuestion() {
  //   if (validateFields()) {
  //     try {
  //       const updatedQuestion = {
  //         id: row?.id,
  //         title: newQuestion.title,
  //         description: newQuestion.description,
  //         category: newQuestion.categories,
  //         complexity: newQuestion.complexity,
  //         link: newQuestion.link,
  //       };

  //       const response = await fetch(`${apiUrl}/questions/update/${row?.id}`, {
  //         method: "PUT",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(updatedQuestion),
  //       });
  //       if (!response.ok) {
  //         throw new Error("Failed to update the question to backend");
  //       }

  //       if (setData) {
  //         setData((prev: Question[]) =>
  //           prev.map((q) => (q.id === row.id ? updatedQuestion : q))
  //         );
  //       }

  //       // Close the dialog after succesful creation
  //       handleClose();
  //     } catch (error) {
  //       alert(
  //         `An error occurred while editing the question ${row?.id}. Please try again.`
  //       );
  //       console.error("Error updating question:", error);
  //     }
  //   }
  // }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="hidden" ref={ref} />
      </DialogTrigger>
      <DialogContent
        className="laptop:max-w-[75vw] bg-white text-black font-sans rounded-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      > {/* we disallow onPointerDownOutside onInteractOutside onEscapeKeyDown since user has prob made changes in inputs */}
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
              <div className="text-red-500 text-sm">Title is required</div>
            )}
          </div>
          {/* <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="summary" className="">
              Summary
            </Label>
            <Input
              id="summary"
              defaultValue={row?.summary ?? ""}
              placeholder="One-line summary"
              onChange={(e) => handleInputChange("summary", e.target.value)}
            />
          </div> */}
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="description" className="">
              Description
            </Label>
            <Textarea
              id="description"
              defaultValue={row?.description ?? ""}
              placeholder="Question description and instructions"
              className="max-h-[50vh] h-[15vh]"
              onChange={(e) => handleInputChange("description", e.target.value)}
            />
            {errors.description && (
              <div className="text-red-500 text-sm">Description is required</div>
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
                  handleInputChange("complexity", capitalizeFirstLetter(value));
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
          <div className="flex flex-col w-full items-start gap-2">
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
            {errors.categories && (
              <div className="text-red-500 text-sm">
                Please select at least one category.
              </div>
            )}
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
            {errors.link && (
              <div className="text-red-500 text-sm">
                Please enter a valid URL.
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="flex">
          <Button
            type="submit"
            className="rounded-lg bg-brand-700 hover:bg-brand-600"
            // onClick={row ? updateQuestion : createQuestion}
            onClick={createQuestion}
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
