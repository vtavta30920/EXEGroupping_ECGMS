"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import type { Group } from "@/lib/types/group";

interface SkillDistributionCardProps {
  groups: Group[];
}

export function SkillDistributionCard({
  groups,
}: SkillDistributionCardProps) {
  // Calculate skill distribution from all members
  const allSkills = groups.flatMap((g) =>
    (g.members || []).flatMap((m: any) => {
      const skills: string[] = [];
      if (m.skillSet) {
        if (typeof m.skillSet === "string") {
          skills.push(m.skillSet);
        } else if (Array.isArray(m.skillSet)) {
          skills.push(...m.skillSet);
        }
      }
      return skills;
    })
  );

  const skillCount = allSkills.reduce((acc: any, skill: string) => {
    if (skill && skill.trim()) {
      acc[skill] = (acc[skill] || 0) + 1;
    }
    return acc;
  }, {});

  const maxSkillCount = Math.max(
    ...Object.values(skillCount).map((v) => (typeof v === "number" ? v : 0)),
    1
  );

  if (Object.keys(skillCount).length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Phân bố kỹ năng trong các nhóm
        </CardTitle>
        <CardDescription>
          Heatmap thể hiện sự phân bố kỹ năng của sinh viên trong các nhóm
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {Object.entries(skillCount)
            .sort(
              ([, a]: [string, any], [, b]: [string, any]) => b - a
            )
            .map(([skill, count]: [string, any]) => {
              const numCount = typeof count === "number" ? count : 0;
              const intensity = Math.min(numCount / maxSkillCount, 1);
              const bgOpacity = 0.2 + intensity * 0.6;
              return (
                <Badge
                  key={skill}
                  variant="secondary"
                  style={{
                    backgroundColor: `rgba(59, 130, 246, ${bgOpacity})`,
                    borderColor: `rgba(59, 130, 246, ${0.5})`,
                  }}
                  className="px-3 py-1.5 text-sm"
                >
                  {skill} ({numCount})
                </Badge>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
}

