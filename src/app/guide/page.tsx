import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

const steps = [
  {
    title: "1. テンプレートを探す",
    description:
      "トップページにプロンプトテンプレートが一覧表示されています。左のカテゴリで絞り込んだり、検索バーでキーワード検索ができます。",
  },
  {
    title: "2. テンプレートを選ぶ",
    description:
      "気になるカードをクリックすると詳細が開きます。テンプレート内の {{変数名}} が自動で検出され、入力フォームが表示されます。",
  },
  {
    title: "3. 変数を入力する",
    description:
      "各変数に値を入力すると、リアルタイムでプレビューが更新されます。完成したプロンプトを確認しながら調整できます。",
  },
  {
    title: "4. コピーして使う",
    description:
      "「コピー」ボタンを押すと、完成したプロンプトがクリップボードにコピーされます。そのまま ChatGPT などの AI ツールに貼り付けて使いましょう。",
  },
  {
    title: "5. 自分のテンプレートを投稿する",
    description:
      "右上の「＋ 新規投稿」ボタンから、自分のプロンプトテンプレートを作成・共有できます。穴埋め箇所は {{変数名}} の形式で記述してください。",
  },
  {
    title: "6. 編集・削除する",
    description:
      "テンプレートの詳細画面の下部にある「編集」ボタンで内容を修正、「削除」ボタンで削除できます。",
  },
];

const syntaxExamples = [
  {
    label: "基本の書き方",
    template: "{{テーマ}} について、{{文字数}} 文字で説明してください。",
  },
  {
    label: "複数の変数",
    template:
      "{{ターゲット読者}} 向けに、{{トーン}} なトーンで {{テーマ}} に関する記事を書いてください。",
  },
  {
    label: "同じ変数の繰り返し",
    template:
      "{{商品名}} のキャッチコピーを5つ考えてください。{{商品名}} の特徴は {{特徴}} です。",
  },
];

export default function GuidePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="mb-2 text-2xl font-bold">Prompt Fill の使い方</h1>
        <p className="text-muted-foreground">
          穴埋め式のテンプレートからプロンプトを簡単に生成・共有できるアプリです。
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step) => (
          <Card key={step.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{step.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold">
          {"{{変数}} の書き方"}
        </h2>
        <div className="space-y-3">
          {syntaxExamples.map((ex) => (
            <div key={ex.label} className="rounded-lg border bg-white p-4">
              <p className="mb-2 text-sm font-medium">{ex.label}</p>
              <p className="rounded-md bg-muted/50 px-3 py-2 text-sm font-mono">
                {ex.template}
              </p>
            </div>
          ))}
        </div>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <p className="text-sm font-medium text-primary">ヒント</p>
          <p className="mt-1 text-sm text-muted-foreground">
            同じ変数名を複数回使うと、一度の入力で全箇所が同時に置き換わります。
            テンプレートを工夫して、繰り返し使えるプロンプトを作りましょう。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
