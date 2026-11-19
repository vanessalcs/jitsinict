import { SchoolSubject } from '../types';

export interface ClassGradeGroup {
  gradeLabel: string;
  subjectType: SchoolSubject;
  classes: string[];
}

export const SCHOOL_CLASS_GROUPS: ClassGradeGroup[] = [
  {
    gradeLabel: '初一 (Junior 1)',
    subjectType: '电脑资讯与工艺',
    classes: ['J1U1', 'J1U2', 'J1U3', 'J1U4', 'J1U5', 'J1U6', 'J1U7', 'J1U8']
  },
  {
    gradeLabel: '初二 (Junior 2)',
    subjectType: '电脑资讯与工艺',
    classes: ['J2U1', 'J2U2', 'J2U3', 'J2U4', 'J2U5', 'J2U6', 'J2U7']
  },
  {
    gradeLabel: '初三 (Junior 3)',
    subjectType: '电脑资讯与工艺',
    classes: ['J3U1', 'J3U2', 'J3U3', 'J3U4', 'J3U5', 'J3U6', 'J3U7', 'J3U8', 'J3U9', 'J3U10', 'J3U11']
  },
  {
    gradeLabel: '高一 (Senior 1)',
    subjectType: '资讯科技',
    classes: ['S1A1', 'S1A2', 'S1A3', 'S1C1', 'S1C2', 'S1C3', 'S1F', 'S1SE', 'S1SC']
  },
  {
    gradeLabel: '高二 (Senior 2)',
    subjectType: '资讯科技',
    classes: ['S2A1', 'S2A2', 'S2C1', 'S2C2', 'S2C3', 'S2C4', 'S2F', 'S2SC', 'S2SE']
  },
  {
    gradeLabel: '高三 (Senior 3)',
    subjectType: '资讯科技',
    classes: ['S3A1', 'S3A2', 'S3A3', 'S3C1', 'S3C2', 'S3C3', 'S3C4', 'S3F', 'S3SC', 'S3SE']
  }
];

export const ALL_SCHOOL_CLASSES: string[] = SCHOOL_CLASS_GROUPS.flatMap(group => group.classes);

/**
 * 判断指定班级所属科目：
 * J 开头 (初中) => 电脑资讯与工艺
 * S 开头 (高中) => 资讯科技
 */
export function getSubjectByClass(className: string): SchoolSubject {
  if (className.startsWith('J')) {
    return '电脑资讯与工艺';
  }
  return '资讯科技';
}
