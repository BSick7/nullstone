module nullstone.markup.xaml.tests {
    QUnit.module('xaml.skipel');

    QUnit.asyncTest("Skip Next Element", () => {
        getDoc("docs/skipel.xml", (doc) => {
            mock.parse(doc.documentElement, (cmds) => {
                QUnit.start();

                //Application
                var i = 0;
                deepEqual(cmds[i], {
                    cmd: 'rt',
                    xmlns: DEFAULT_XMLNS,
                    name: 'Application',
                    type: cmds[i].type
                }, 'rt Application');
                i++;
                var app = cmds[i].obj;
                deepEqual(cmds[i], {
                    cmd: 'or',
                    type: cmds[i - 1].type,
                    obj: app
                }, 'or Application');
                i++;
                deepEqual(cmds[i], {
                    cmd: 'o',
                    obj: app,
                    isContent: true
                }, 'o(c) Application');
                i++;
                deepEqual(cmds[i], {
                    cmd: 'rt',
                    xmlns: DEFAULT_XMLNS,
                    name: 'SkipMe',
                    type: cmds[i].type
                }, 'rt SkipMe');
                i++;
                var sm = cmds[i].obj;
                deepEqual(cmds[i], {
                    cmd: 'or',
                    type: cmds[i - 1].type,
                    obj: sm
                }, 'or SkipMe');
                i++;
                deepEqual(cmds[i], {
                    cmd: 'o',
                    obj: sm,
                    isContent: true
                }, 'o(c) SkipMe');
                i++;
                deepEqual(cmds[i], {
                    cmd: 'oe',
                    obj: sm,
                    key: undefined,
                    isContent: true
                }, 'oe SkipMe');
                i++;
                deepEqual(cmds[i], {
                    cmd: 'bskip',
                    root: cmds[i].root,
                    obj: sm
                }, 'bskip');
                //Application - End
                i++;
                deepEqual(cmds[i], {
                    cmd: 'oe',
                    obj: app,
                    key: undefined,
                    isContent: true
                }, 'oe Application');
                strictEqual(cmds.length, i + 1);
            }, 'SkipMe');
        }, (err) => {
            QUnit.start();
            ok(false, err.message);
        });
    });
}