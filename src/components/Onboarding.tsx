import { useState } from "react";
import { Button, Card, Chip, Field, Input } from "./ui";
import { useStore } from "@/lib/store";
import { PRIORITIES, uid } from "@/lib/demo-data";

export function Onboarding() {
  const { setState } = useStore();
  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [personName, setPersonName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [multiple, setMultiple] = useState<boolean | null>(null);
  const [priorities, setPriorities] = useState<string[]>([]);

  const toggle = (p: string) =>
    setPriorities((v) => (v.includes(p) ? v.filter((x) => x !== p) : [...v, p]));

  const finish = () => {
    setState((s) => ({
      ...s,
      onboarded: true,
      caregiverName: firstName.trim() || s.caregiverName,
      priorities,
      people: personName.trim()
        ? [
            ...s.people,
            {
              id: uid(),
              name: personName.trim(),
              preferredName: personName.trim().split(" ")[0] ?? personName.trim(),
              relationship: relationship.trim() || "Someone I care for",
              pronouns: "",
              whatMatters: [],
              routines: [],
              preferences: [],
              communication: [],
              comfort: [],
              updates: [],
              coordination: [],
              voiceInvited: false,
              voiceEntries: [],
            },
          ]
        : s.people,
    }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-xl">
        <p className="mb-6 text-center font-display text-lg text-muted-foreground">
          Connected Care
        </p>

        {step === 0 && (
          <Card className="text-center">
            <h1 className="font-display text-4xl leading-tight">
              Care for them without losing yourself.
            </h1>
            <p className="mx-auto mt-4 max-w-md text-lg text-muted-foreground">
              A space to understand your needs, remember what matters, and coordinate care with
              people you trust.
            </p>
            <Button className="mt-8 w-full sm:w-auto" onClick={() => setStep(1)}>
              Set Up My Care Space
            </Button>
          </Card>
        )}

        {step === 1 && (
          <Card>
            <h1 className="font-display text-3xl">A little about you</h1>
            <div className="mt-6 space-y-5">
              <Field label="First name">
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jordan"
                />
              </Field>
              <Field label="Who do you help care for?">
                <Input
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  placeholder="Ruth Ellis"
                />
              </Field>
              <Field label="What is your relationship to them?">
                <Input
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  placeholder="My mother"
                />
              </Field>
              <Field
                label="Do you care for more than one person?"
                hint="You can always add another person later."
              >
                <div className="flex gap-2">
                  <Chip selected={multiple === true} onClick={() => setMultiple(true)}>
                    Yes
                  </Chip>
                  <Chip selected={multiple === false} onClick={() => setMultiple(false)}>
                    No
                  </Chip>
                </div>
              </Field>
            </div>
            <div className="mt-8 flex gap-3">
              <Button variant="quiet" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button className="flex-1" onClick={() => setStep(2)}>
                Continue
              </Button>
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <h1 className="font-display text-3xl">What would help most right now?</h1>
            <p className="mt-2 text-base text-muted-foreground">Choose as many as you like.</p>
            <div className="mt-6 flex flex-col gap-3">
              {PRIORITIES.map((p) => (
                <Chip key={p} selected={priorities.includes(p)} onClick={() => toggle(p)}>
                  {p}
                </Chip>
              ))}
            </div>
            <div className="mt-8 flex gap-3">
              <Button variant="quiet" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button className="flex-1" onClick={finish}>
                Enter my care space
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
