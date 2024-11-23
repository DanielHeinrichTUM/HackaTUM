"use client";
import React, { useRef, useState, useEffect } from "react";

interface GuessInputProps {
  length: number;
  solution: string;
  onComplete: (guess: string) => void;
  hints: string; // A string with fixed letters and spaces for hints
  className?: string;
}

export function GuessInput({
  length,
  solution,
  onComplete,
  hints,
  className,
}: GuessInputProps) {
  const [guess, setGuess] = useState(() =>
    hints.split("").map((char) => (char.trim() ? char.toUpperCase() : ""))
  );
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Auto-focus first box
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    setGuess(
      hints.split("").map((char) => (char.trim() ? char.toUpperCase() : ""))
    );
  }, [hints]);

  const handleChange = (index: number, value: string) => {
    if (hints[index] !== " " || value.length > 1) return; // Prevent changing hint values

    const newGuess = [...guess];
    newGuess[index] = value.toUpperCase();
    setGuess(newGuess);

    // Find the next editable input
    let nextIndex = index + 1;
    while (nextIndex < length && hints[nextIndex] !== " ") {
      nextIndex++;
    }

    if (value && nextIndex < length) {
      if (solution[nextIndex] !== " ") {
        inputRefs.current[nextIndex]?.focus();
      } else {
        if (nextIndex + 1 < length) inputRefs.current[nextIndex + 1]?.focus();
      }
    }

    if (
      newGuess.filter((char) => char !== "").length ===
      solution.split("").filter((c) => c !== " ").length
    ) {
      // Rebuild the guess string by inserting spaces from the solution
      const shiftGuess = [...newGuess.map((c) => (c === "" ? " " : c))];

      onComplete(shiftGuess.join(""));
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (hints[index] === " ") {
      if (e.key === "Backspace" && !guess[index] && index > 0) {
        // Find the previous editable input
        let prevIndex = index - 1;
        while (prevIndex >= 0 && hints[prevIndex] !== " ") {
          prevIndex--;
        }
        if (prevIndex >= 0) {
          inputRefs.current[prevIndex]?.focus();
        }
      }
    }
  };

  // Group inputs by words
  const words = solution.split(" ").map((word, i) => ({
    word,
    startIndex: solution.split(" ", i).join(" ").length + (i > 0 ? 1 : 0), // Calculate starting index
  }));

  return (
    <div
      key={`${length}-${hints}`}
      className={`flex flex-wrap gap-2 ${
        className ? className : ""
      } justify-center`}
    >
      {words.map(({ word, startIndex }) => (
        <div
          key={startIndex}
          className="flex gap-2 flex-shrink flex-nowrap"
          style={{ flexShrink: 1 }}
        >
          {startIndex === 0 ? (
            <div className="flex text-gray-800 text-5xl font-bold mr-2 min-w-[30px]">
              {"="}
            </div>
          ) : null}
          {word.split("").map((_, index) => {
            const charIndex = startIndex + index;
            return (
              <input
                key={charIndex}
                ref={(el) => {
                  inputRefs.current[charIndex] = el;
                }}
                type="text"
                value={guess[charIndex]}
                onChange={(e) => handleChange(charIndex, e.target.value)}
                onKeyDown={(e) => handleKeyDown(charIndex, e)}
                className={`w-[calc(100%/10)] h-12 text-center text-2xl border-2 rounded-md focus:outline-none ${
                  hints[charIndex] !== " "
                    ? "bg-green-200 border-green-500 text-green-800"
                    : "border-gray-300 focus:border-blue-500"
                }`}
                maxLength={1}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
